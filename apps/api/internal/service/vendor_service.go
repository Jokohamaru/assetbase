package service

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/Jokohamaru/assetbase/internal/database"
	"github.com/Jokohamaru/assetbase/internal/dto"
	"github.com/Jokohamaru/assetbase/prisma/db"
)

type VendorService struct{}

func NewVendorService() *VendorService {
	return &VendorService{}
}

func (s *VendorService) CreateVendor(ctx context.Context, req dto.CreateVendorRequest) (*db.VendorModel, error) {
	// Check code uniqueness
	existing, _ := database.Client.Vendor.FindUnique(db.Vendor.Code.Equals(req.Code)).Exec(ctx)
	if existing != nil {
		return nil, errors.New("mã nhà cung cấp đã tồn tại")
	}

	var optionalParams []db.VendorSetParam
	if req.TaxCode != "" {
		optionalParams = append(optionalParams, db.Vendor.TaxCode.Set(req.TaxCode))
	}
	if req.Email != "" {
		optionalParams = append(optionalParams, db.Vendor.Email.Set(req.Email))
	}
	if req.Phone != "" {
		optionalParams = append(optionalParams, db.Vendor.Phone.Set(req.Phone))
	}
	if req.Address != "" {
		optionalParams = append(optionalParams, db.Vendor.Address.Set(req.Address))
	}
	if req.Certifications != "" {
		optionalParams = append(optionalParams, db.Vendor.Certifications.Set(req.Certifications))
	}
	if req.Notes != "" {
		optionalParams = append(optionalParams, db.Vendor.Notes.Set(req.Notes))
	}

	return database.Client.Vendor.CreateOne(
		db.Vendor.Code.Set(req.Code),
		db.Vendor.Name.Set(req.Name),
		db.Vendor.Category.Set(req.Category),
		db.Vendor.Contact.Set(req.Contact),
		db.Vendor.Status.Set(req.Status),
		optionalParams...,
	).Exec(ctx)
}

func (s *VendorService) UpdateVendor(ctx context.Context, id string, req dto.UpdateVendorRequest) (*db.VendorModel, error) {
	var optionalParams []db.VendorSetParam
	if req.Name != "" {
		optionalParams = append(optionalParams, db.Vendor.Name.Set(req.Name))
	}
	if req.TaxCode != "" {
		optionalParams = append(optionalParams, db.Vendor.TaxCode.Set(req.TaxCode))
	}
	if req.Category != "" {
		optionalParams = append(optionalParams, db.Vendor.Category.Set(req.Category))
	}
	if req.Contact != "" {
		optionalParams = append(optionalParams, db.Vendor.Contact.Set(req.Contact))
	}
	if req.Email != "" {
		optionalParams = append(optionalParams, db.Vendor.Email.Set(req.Email))
	}
	if req.Phone != "" {
		optionalParams = append(optionalParams, db.Vendor.Phone.Set(req.Phone))
	}
	if req.Address != "" {
		optionalParams = append(optionalParams, db.Vendor.Address.Set(req.Address))
	}
	if req.Certifications != "" {
		optionalParams = append(optionalParams, db.Vendor.Certifications.Set(req.Certifications))
	}
	if req.Status != "" {
		optionalParams = append(optionalParams, db.Vendor.Status.Set(req.Status))
	}
	if req.Notes != "" {
		optionalParams = append(optionalParams, db.Vendor.Notes.Set(req.Notes))
	}

	if len(optionalParams) == 0 {
		return database.Client.Vendor.FindUnique(db.Vendor.ID.Equals(id)).Exec(ctx)
	}

	return database.Client.Vendor.FindUnique(
		db.Vendor.ID.Equals(id),
	).Update(
		optionalParams...,
	).Exec(ctx)
}

func (s *VendorService) ListVendors(ctx context.Context, category, status string) ([]db.VendorModel, error) {
	var filters []db.VendorWhereParam
	if category != "" {
		filters = append(filters, db.Vendor.Category.Equals(category))
	}
	if status != "" {
		filters = append(filters, db.Vendor.Status.Equals(status))
	}

	return database.Client.Vendor.FindMany(filters...).
		OrderBy(db.Vendor.Name.Order(db.SortOrderAsc)).
		Exec(ctx)
}

func (s *VendorService) GetVendor(ctx context.Context, id string) (*db.VendorModel, error) {
	return database.Client.Vendor.FindUnique(
		db.Vendor.ID.Equals(id),
	).With(
		db.Vendor.Entitlements.Fetch(),
	).Exec(ctx)
}

func (s *VendorService) EvaluateVendor(ctx context.Context, id string, req dto.EvaluateVendorRequest) (*db.VendorModel, error) {
	if len(req.Scores) == 0 {
		return nil, errors.New("dữ liệu đánh giá không hợp lệ")
	}

	// Calculate average score
	totalScore := 0
	count := 0
	for _, s := range req.Scores {
		totalScore += s
		count++
	}
	avgScore := totalScore / count

	// Convert to JSON byte array
	scoresBytes, err := json.Marshal(req.Scores)
	if err != nil {
		return nil, err
	}

	return database.Client.Vendor.FindUnique(
		db.Vendor.ID.Equals(id),
	).Update(
		db.Vendor.Score.Set(avgScore),
		db.Vendor.Scores.Set(scoresBytes),
		db.Vendor.LastEvaluation.Set(time.Now()),
	).Exec(ctx)
}
