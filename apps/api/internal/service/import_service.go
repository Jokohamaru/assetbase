package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"mime/multipart"
	"strconv"
	"time"

	"github.com/Jokohamaru/assetbase/internal/database"
	"github.com/Jokohamaru/assetbase/internal/dto"
	"github.com/Jokohamaru/assetbase/prisma/db"
	"github.com/steebchen/prisma-client-go/runtime/transaction"
	"github.com/xuri/excelize/v2"
)

type ImportService struct{}

func NewImportService() *ImportService {
	return &ImportService{}
}

func (s *ImportService) UploadFile(ctx context.Context, creatorID string, fileHeader *multipart.FileHeader) (*db.AssetImportBatchModel, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return nil, err
	}
	defer file.Close()

	// Parse Excel
	f, err := excelize.OpenReader(file)
	if err != nil {
		return nil, errors.New("invalid excel file")
	}
	defer f.Close()

	// Assume data is in the first sheet
	sheets := f.GetSheetList()
	if len(sheets) == 0 {
		return nil, errors.New("excel file has no sheets")
	}
	sheetName := sheets[0]
	rows, err := f.GetRows(sheetName)
	if err != nil {
		return nil, err
	}

	if len(rows) < 2 {
		return nil, errors.New("file is empty or has no data rows")
	}

	// Read Headers (skip for now, assume strict order: 
	// AssetTag, Name, SerialNumber, Barcode, CategoryCode, ModelName, ManufacturerName, DepartmentCode, LocationCode, WarehouseCode, StatusCode, PurchaseCost, PurchaseDate, WarrantyExpiry)

	batch, err := database.Client.AssetImportBatch.CreateOne(
		db.AssetImportBatch.SourceFileName.Set(fileHeader.Filename),
		db.AssetImportBatch.TotalRows.Set(len(rows)-1),
		db.AssetImportBatch.Creator.Link(db.User.ID.Equals(creatorID)),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	var validCount, invalidCount int

	for i := 1; i < len(rows); i++ {
		row := rows[i]
		// Pad row if it has less columns than expected
		for len(row) < 14 {
			row = append(row, "")
		}

		payload := dto.ImportAssetRow{
			AssetTag:         row[0],
			Name:             row[1],
			SerialNumber:     row[2],
			Barcode:          row[3],
			CategoryCode:     row[4],
			ModelName:        row[5],
			ManufacturerName: row[6],
			DepartmentCode:   row[7],
			LocationCode:     row[8],
			WarehouseCode:    row[9],
			StatusCode:       row[10],
		}

		if row[11] != "" {
			if cost, err := strconv.ParseFloat(row[11], 64); err == nil {
				payload.PurchaseCost = cost
			}
		}
		payload.PurchaseDateStr = row[12]
		payload.WarrantyExpiryStr = row[13]

		var rowErrors []dto.ImportRowError
		if payload.AssetTag == "" {
			rowErrors = append(rowErrors, dto.ImportRowError{Field: "assetTag", Message: "Mã tài sản không được để trống"})
		}
		if payload.Name == "" {
			rowErrors = append(rowErrors, dto.ImportRowError{Field: "name", Message: "Tên tài sản không được để trống"})
		}
		if payload.CategoryCode == "" {
			rowErrors = append(rowErrors, dto.ImportRowError{Field: "categoryCode", Message: "Mã danh mục không được để trống"})
		}
		if payload.StatusCode == "" {
			rowErrors = append(rowErrors, dto.ImportRowError{Field: "statusCode", Message: "Trạng thái không được để trống"})
		}

		// Check uniqueness and existence in DB (simplified for demo, in production we might batch fetch categories/departments to avoid N+1 queries)
		if payload.CategoryCode != "" {
			_, err := database.Client.AssetCategory.FindUnique(db.AssetCategory.Code.Equals(payload.CategoryCode)).Exec(ctx)
			if err != nil {
				rowErrors = append(rowErrors, dto.ImportRowError{Field: "categoryCode", Message: "Mã danh mục không tồn tại"})
			}
		}
		if payload.DepartmentCode != "" {
			_, err := database.Client.Department.FindUnique(db.Department.Code.Equals(payload.DepartmentCode)).Exec(ctx)
			if err != nil {
				rowErrors = append(rowErrors, dto.ImportRowError{Field: "departmentCode", Message: "Mã phòng ban không tồn tại"})
			}
		}

		if payload.AssetTag != "" {
			_, err := database.Client.Asset.FindUnique(db.Asset.AssetTag.Equals(payload.AssetTag)).Exec(ctx)
			if err == nil {
				rowErrors = append(rowErrors, dto.ImportRowError{Field: "assetTag", Message: "Mã tài sản đã tồn tại trong hệ thống"})
			}
		}

		status := db.AssetImportRowStatusValid
		if len(rowErrors) > 0 {
			status = db.AssetImportRowStatusInvalid
			invalidCount++
		} else {
			validCount++
		}

		payloadBytes, _ := json.Marshal(payload)
		errorsBytes, _ := json.Marshal(rowErrors)

		_, _ = database.Client.AssetImportRow.CreateOne(
			db.AssetImportRow.RowNumber.Set(i),
			db.AssetImportRow.Payload.Set(payloadBytes),
			db.AssetImportRow.Status.Set(status),
			db.AssetImportRow.Batch.Link(db.AssetImportBatch.ID.Equals(batch.ID)),
			db.AssetImportRow.Errors.Set(errorsBytes),
		).Exec(ctx)
	}

	updatedBatch, err := database.Client.AssetImportBatch.FindUnique(
		db.AssetImportBatch.ID.Equals(batch.ID),
	).Update(
		db.AssetImportBatch.ValidRows.Set(validCount),
		db.AssetImportBatch.InvalidRows.Set(invalidCount),
	).Exec(ctx)

	return updatedBatch, err
}

func (s *ImportService) ListBatches(ctx context.Context, page, limit int) ([]db.AssetImportBatchModel, error) {
	offset := (page - 1) * limit
	return database.Client.AssetImportBatch.FindMany().
		Skip(offset).
		Take(limit).
		OrderBy(db.AssetImportBatch.CreatedAt.Order(db.SortOrderDesc)).
		Exec(ctx)
}

func (s *ImportService) GetBatch(ctx context.Context, id string) (*db.AssetImportBatchModel, error) {
	return database.Client.AssetImportBatch.FindUnique(
		db.AssetImportBatch.ID.Equals(id),
	).Exec(ctx)
}

func (s *ImportService) GetBatchRows(ctx context.Context, batchID string, page, limit int) ([]db.AssetImportRowModel, error) {
	offset := (page - 1) * limit
	return database.Client.AssetImportRow.FindMany(
		db.AssetImportRow.BatchID.Equals(batchID),
	).Skip(offset).Take(limit).OrderBy(db.AssetImportRow.RowNumber.Order(db.SortOrderAsc)).Exec(ctx)
}

func (s *ImportService) CommitBatch(ctx context.Context, batchID string) (*db.AssetImportBatchModel, error) {
	batch, err := database.Client.AssetImportBatch.FindUnique(db.AssetImportBatch.ID.Equals(batchID)).Exec(ctx)
	if err != nil || batch.Status != db.AssetImportStatusStaged {
		return nil, errors.New("batch not found or not in staged status")
	}

	if batch.InvalidRows > 0 {
		return nil, errors.New("cannot commit batch with invalid rows")
	}

	rows, err := database.Client.AssetImportRow.FindMany(
		db.AssetImportRow.BatchID.Equals(batchID),
		db.AssetImportRow.Status.Equals(db.AssetImportRowStatusValid),
	).Exec(ctx)

	if err != nil {
		return nil, err
	}

	var queries []transaction.Param
	committedCount := 0

	for _, row := range rows {
		var payload dto.ImportAssetRow
		_ = json.Unmarshal(row.Payload, &payload)

		category, err := database.Client.AssetCategory.FindUnique(db.AssetCategory.Code.Equals(payload.CategoryCode)).Exec(ctx)
		if err != nil {
			return nil, err
		}
		
		status, err := database.Client.AssetStatus.FindUnique(db.AssetStatus.Code.Equals(payload.StatusCode)).Exec(ctx)
		if err != nil {
			return nil, err
		}

		var createOps []db.AssetSetParam
		if payload.SerialNumber != "" {
			createOps = append(createOps, db.Asset.SerialNumber.Set(payload.SerialNumber))
		}
		if payload.Barcode != "" {
			createOps = append(createOps, db.Asset.Barcode.Set(payload.Barcode))
		}
		if payload.DepartmentCode != "" {
			dept, err := database.Client.Department.FindUnique(db.Department.Code.Equals(payload.DepartmentCode)).Exec(ctx)
			if err == nil {
				createOps = append(createOps, db.Asset.Department.Link(db.Department.ID.Equals(dept.ID)))
			}
		}

		queries = append(queries, database.Client.Asset.CreateOne(
			db.Asset.AssetTag.Set(payload.AssetTag),
			db.Asset.Name.Set(payload.Name),
			db.Asset.Category.Link(db.AssetCategory.ID.Equals(category.ID)),
			db.Asset.Status.Link(db.AssetStatus.ID.Equals(status.ID)),
			createOps...,
		).Tx())

		queries = append(queries, database.Client.AssetImportRow.FindUnique(
			db.AssetImportRow.ID.Equals(row.ID),
		).Update(
			db.AssetImportRow.Asset.Link(db.Asset.AssetTag.Equals(payload.AssetTag)),
			db.AssetImportRow.Status.Set(db.AssetImportRowStatusCommitted),
		).Tx())

		committedCount++
	}

	err = database.Client.Prisma.Transaction(queries...).Exec(ctx)

	if err != nil {
		_, _ = database.Client.AssetImportBatch.FindUnique(db.AssetImportBatch.ID.Equals(batchID)).Update(
			db.AssetImportBatch.Status.Set(db.AssetImportStatusRolledBack),
		).Exec(ctx)
		return nil, fmt.Errorf("transaction failed: %v", err)
	}

	updatedBatch, err := database.Client.AssetImportBatch.FindUnique(
		db.AssetImportBatch.ID.Equals(batchID),
	).Update(
		db.AssetImportBatch.Status.Set(db.AssetImportStatusCommitted),
		db.AssetImportBatch.CommittedAt.Set(time.Now()),
		db.AssetImportBatch.CommittedRows.Set(committedCount),
	).Exec(ctx)

	return updatedBatch, err
}

func (s *ImportService) RollbackBatch(ctx context.Context, batchID string) (*db.AssetImportBatchModel, error) {
	batch, err := database.Client.AssetImportBatch.FindUnique(db.AssetImportBatch.ID.Equals(batchID)).Exec(ctx)
	if err != nil || batch.Status != db.AssetImportStatusStaged {
		return nil, errors.New("batch not found or not in staged status")
	}

	updatedBatch, err := database.Client.AssetImportBatch.FindUnique(
		db.AssetImportBatch.ID.Equals(batchID),
	).Update(
		db.AssetImportBatch.Status.Set(db.AssetImportStatusRolledBack),
		db.AssetImportBatch.RolledBackAt.Set(time.Now()),
	).Exec(ctx)

	return updatedBatch, err
}
