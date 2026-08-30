package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/Jokohamaru/assetbase/internal/database"
	"github.com/Jokohamaru/assetbase/internal/dto"
	"github.com/Jokohamaru/assetbase/prisma/db"
)

type InventoryService struct{}

func NewInventoryService() *InventoryService {
	return &InventoryService{}
}

func (s *InventoryService) ListSessions(ctx context.Context, page, limit int) ([]db.InventorySessionModel, error) {
	offset := (page - 1) * limit
	return database.Client.InventorySession.FindMany().
		Skip(offset).
		Take(limit).
		OrderBy(db.InventorySession.CreatedAt.Order(db.SortOrderDesc)).
		Exec(ctx)
}

func (s *InventoryService) GetSessionByID(ctx context.Context, id string) (*db.InventorySessionModel, error) {
	session, err := database.Client.InventorySession.FindUnique(
		db.InventorySession.ID.Equals(id),
	).With(
		db.InventorySession.Items.Fetch().With(
			db.InventoryItem.Asset.Fetch(),
		),
		db.InventorySession.ScopeDepartment.Fetch(),
		db.InventorySession.ScopeLocation.Fetch(),
		db.InventorySession.ScopeWarehouse.Fetch(),
		db.InventorySession.ScopeCategory.Fetch(),
	).Exec(ctx)

	if err != nil {
		return nil, errors.New("inventory session not found")
	}
	return session, nil
}

func (s *InventoryService) CreateSession(ctx context.Context, creatorID string, req dto.CreateInventorySessionRequest) (*db.InventorySessionModel, error) {
	inventoryNo := fmt.Sprintf("INV-%d", time.Now().Unix())

	var ops []db.InventorySessionSetParam
	if req.ScopeDepartmentID != nil && *req.ScopeDepartmentID != "" {
		ops = append(ops, db.InventorySession.ScopeDepartment.Link(db.Department.ID.Equals(*req.ScopeDepartmentID)))
	}
	if req.ScopeLocationID != nil && *req.ScopeLocationID != "" {
		ops = append(ops, db.InventorySession.ScopeLocation.Link(db.Location.ID.Equals(*req.ScopeLocationID)))
	}
	if req.ScopeWarehouseID != nil && *req.ScopeWarehouseID != "" {
		ops = append(ops, db.InventorySession.ScopeWarehouse.Link(db.Warehouse.ID.Equals(*req.ScopeWarehouseID)))
	}
	if req.ScopeCategoryID != nil && *req.ScopeCategoryID != "" {
		ops = append(ops, db.InventorySession.ScopeCategory.Link(db.AssetCategory.ID.Equals(*req.ScopeCategoryID)))
	}

	session, err := database.Client.InventorySession.CreateOne(
		db.InventorySession.InventoryNo.Set(inventoryNo),
		db.InventorySession.Name.Set(req.Name),
		db.InventorySession.Creator.Link(db.User.ID.Equals(creatorID)),
		ops...,
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	// Fetch assets matching the scope
	var assetQuery []db.AssetWhereParam
	if req.ScopeDepartmentID != nil && *req.ScopeDepartmentID != "" {
		assetQuery = append(assetQuery, db.Asset.DepartmentID.Equals(*req.ScopeDepartmentID))
	}
	if req.ScopeLocationID != nil && *req.ScopeLocationID != "" {
		assetQuery = append(assetQuery, db.Asset.LocationID.Equals(*req.ScopeLocationID))
	}
	if req.ScopeWarehouseID != nil && *req.ScopeWarehouseID != "" {
		assetQuery = append(assetQuery, db.Asset.WarehouseID.Equals(*req.ScopeWarehouseID))
	}
	if req.ScopeCategoryID != nil && *req.ScopeCategoryID != "" {
		assetQuery = append(assetQuery, db.Asset.CategoryID.Equals(*req.ScopeCategoryID))
	}
	assetQuery = append(assetQuery, db.Asset.DeletedAt.IsNull())

	assets, err := database.Client.Asset.FindMany(assetQuery...).Exec(ctx)
	if err != nil {
		return nil, err
	}

	// Create pending InventoryItems
	for _, asset := range assets {
		var itemOps []db.InventoryItemSetParam
		
		locID, ok := asset.LocationID()
		if ok {
			itemOps = append(itemOps, db.InventoryItem.ExpectedLocation.Link(db.Location.ID.Equals(locID)))
		}
		
		custodianID, ok := asset.CurrentCustodianID()
		if ok {
			itemOps = append(itemOps, db.InventoryItem.ExpectedCustodian.Link(db.Person.ID.Equals(custodianID)))
		}

		_, _ = database.Client.InventoryItem.CreateOne(
			db.InventoryItem.Session.Link(db.InventorySession.ID.Equals(session.ID)),
			db.InventoryItem.Asset.Link(db.Asset.ID.Equals(asset.ID)),
			itemOps...,
		).Exec(ctx)
	}

	return session, nil
}

func (s *InventoryService) ScanItem(ctx context.Context, sessionID string, scannerID string, req dto.ScanInventoryItemRequest) (*db.InventoryItemModel, error) {
	// Find session
	session, err := database.Client.InventorySession.FindUnique(db.InventorySession.ID.Equals(sessionID)).Exec(ctx)
	if err != nil || session.Status == db.InventoryStatusClosed {
		return nil, errors.New("session not found or closed")
	}

	// Find Asset by ID or Barcode or Serial
	var assetQuery []db.AssetWhereParam
	if req.AssetID != nil && *req.AssetID != "" {
		assetQuery = append(assetQuery, db.Asset.ID.Equals(*req.AssetID))
	} else if req.Barcode != nil && *req.Barcode != "" {
		assetQuery = append(assetQuery, db.Asset.Barcode.Equals(*req.Barcode))
	} else if req.SerialNumber != nil && *req.SerialNumber != "" {
		assetQuery = append(assetQuery, db.Asset.SerialNumber.Equals(*req.SerialNumber))
	} else {
		return nil, errors.New("missing asset identifier")
	}

	asset, err := database.Client.Asset.FindFirst(assetQuery...).Exec(ctx)
	if err != nil {
		return nil, errors.New("asset not found in system")
	}

	// Find if asset is already in this session's items
	item, err := database.Client.InventoryItem.FindFirst(
		db.InventoryItem.SessionID.Equals(sessionID),
		db.InventoryItem.AssetID.Equals(asset.ID),
	).Exec(ctx)

	now := time.Now()
	result := db.InventoryResultMatched
	if req.ObservedLocationID != nil && *req.ObservedLocationID != "" {
		locID, ok := asset.LocationID()
		if !ok || locID != *req.ObservedLocationID {
			result = db.InventoryResultLocationMismatch
		}
	}

	if err != nil {
		// Asset not in original scope -> Unexpected
		result = db.InventoryResultUnexpected
		var itemOps []db.InventoryItemSetParam
		itemOps = append(itemOps, db.InventoryItem.Result.Set(result))
		itemOps = append(itemOps, db.InventoryItem.ScannedAt.Set(now))
		itemOps = append(itemOps, db.InventoryItem.Scanner.Link(db.User.ID.Equals(scannerID)))
		
		if req.ObservedLocationID != nil && *req.ObservedLocationID != "" {
			itemOps = append(itemOps, db.InventoryItem.ObservedLocation.Link(db.Location.ID.Equals(*req.ObservedLocationID)))
		}
		if req.Note != nil && *req.Note != "" {
			itemOps = append(itemOps, db.InventoryItem.Note.Set(*req.Note))
		}

		newItem, err := database.Client.InventoryItem.CreateOne(
			db.InventoryItem.Session.Link(db.InventorySession.ID.Equals(sessionID)),
			db.InventoryItem.Asset.Link(db.Asset.ID.Equals(asset.ID)),
			itemOps...,
		).Exec(ctx)
		if err != nil {
			return nil, err
		}
		return newItem, nil
	}

	// Update existing item
	var updateOps []db.InventoryItemSetParam
	updateOps = append(updateOps, db.InventoryItem.Result.Set(result))
	updateOps = append(updateOps, db.InventoryItem.ScannedAt.Set(now))
	updateOps = append(updateOps, db.InventoryItem.Scanner.Link(db.User.ID.Equals(scannerID)))
	
	if req.ObservedLocationID != nil && *req.ObservedLocationID != "" {
		updateOps = append(updateOps, db.InventoryItem.ObservedLocation.Link(db.Location.ID.Equals(*req.ObservedLocationID)))
	}
	if req.Note != nil && *req.Note != "" {
		updateOps = append(updateOps, db.InventoryItem.Note.Set(*req.Note))
	}

	updatedItem, err := database.Client.InventoryItem.FindUnique(db.InventoryItem.ID.Equals(item.ID)).Update(updateOps...).Exec(ctx)
	if err != nil {
		return nil, err
	}

	return updatedItem, nil
}

func (s *InventoryService) CloseSession(ctx context.Context, sessionID string) (*db.InventorySessionModel, error) {
	// Find session
	session, err := database.Client.InventorySession.FindUnique(db.InventorySession.ID.Equals(sessionID)).Exec(ctx)
	if err != nil || session.Status == db.InventoryStatusClosed {
		return nil, errors.New("session not found or already closed")
	}

	now := time.Now()

	// Update all pending items to Missing
	_, _ = database.Client.InventoryItem.FindMany(
		db.InventoryItem.SessionID.Equals(sessionID),
		db.InventoryItem.Result.Equals(db.InventoryResultPending),
	).Update(
		db.InventoryItem.Result.Set(db.InventoryResultMissing),
	).Exec(ctx)

	// Close session
	updatedSession, err := database.Client.InventorySession.FindUnique(db.InventorySession.ID.Equals(sessionID)).Update(
		db.InventorySession.Status.Set(db.InventoryStatusClosed),
		db.InventorySession.ClosedAt.Set(now),
	).Exec(ctx)

	if err != nil {
		return nil, err
	}

	return updatedSession, nil
}
