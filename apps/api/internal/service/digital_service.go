package service

import (
	"context"
	"errors"
	"time"

	"github.com/Jokohamaru/assetbase/internal/database"
	"github.com/Jokohamaru/assetbase/internal/dto"
	"github.com/Jokohamaru/assetbase/prisma/db"
	"github.com/shopspring/decimal"
)

type DigitalService struct{}

func NewDigitalService() *DigitalService {
	return &DigitalService{}
}

func (s *DigitalService) CreateEntitlement(ctx context.Context, creatorID string, req dto.CreateEntitlementRequest) (*db.DigitalEntitlementModel, error) {
	var optionalParams []db.DigitalEntitlementSetParam
	if req.ProductName != "" {
		optionalParams = append(optionalParams, db.DigitalEntitlement.ProductName.Set(req.ProductName))
	}
	if req.Edition != "" {
		optionalParams = append(optionalParams, db.DigitalEntitlement.Edition.Set(req.Edition))
	}
	if req.SubscriptionIdentifier != "" {
		optionalParams = append(optionalParams, db.DigitalEntitlement.SubscriptionIdentifier.Set(req.SubscriptionIdentifier))
	}
	if req.DomainName != "" {
		optionalParams = append(optionalParams, db.DigitalEntitlement.DomainName.Set(req.DomainName))
	}
	if req.CommonName != "" {
		optionalParams = append(optionalParams, db.DigitalEntitlement.CommonName.Set(req.CommonName))
	}
	if req.Registrar != "" {
		optionalParams = append(optionalParams, db.DigitalEntitlement.Registrar.Set(req.Registrar))
	}
	if req.Issuer != "" {
		optionalParams = append(optionalParams, db.DigitalEntitlement.Issuer.Set(req.Issuer))
	}
	if req.LicenseMetric != "" {
		optionalParams = append(optionalParams, db.DigitalEntitlement.LicenseMetric.Set(req.LicenseMetric))
	}
	if req.StartDate != nil {
		optionalParams = append(optionalParams, db.DigitalEntitlement.StartDate.Set(*req.StartDate))
	}
	if req.ExpiryDate != nil {
		optionalParams = append(optionalParams, db.DigitalEntitlement.ExpiryDate.Set(*req.ExpiryDate))
	}
	if req.PurchaseCost != nil {
		optionalParams = append(optionalParams, db.DigitalEntitlement.PurchaseCost.Set(decimal.NewFromFloat(*req.PurchaseCost)))
	}
	if req.RenewalCost != nil {
		optionalParams = append(optionalParams, db.DigitalEntitlement.RenewalCost.Set(decimal.NewFromFloat(*req.RenewalCost)))
	}
	if req.Currency != "" {
		optionalParams = append(optionalParams, db.DigitalEntitlement.Currency.Set(req.Currency))
	}
	if req.PurchaseOrderNo != "" {
		optionalParams = append(optionalParams, db.DigitalEntitlement.PurchaseOrderNo.Set(req.PurchaseOrderNo))
	}
	if req.ContractNo != "" {
		optionalParams = append(optionalParams, db.DigitalEntitlement.ContractNo.Set(req.ContractNo))
	}
	if req.ManagementUrl != "" {
		optionalParams = append(optionalParams, db.DigitalEntitlement.ManagementURL.Set(req.ManagementUrl))
	}
	if req.Notes != "" {
		optionalParams = append(optionalParams, db.DigitalEntitlement.Notes.Set(req.Notes))
	}
	if req.VendorId != "" {
		optionalParams = append(optionalParams, db.DigitalEntitlement.Vendor.Link(db.Vendor.ID.Equals(req.VendorId)))
	}
	if req.OwnerDepartmentId != "" {
		optionalParams = append(optionalParams, db.DigitalEntitlement.OwnerDepartment.Link(db.Department.ID.Equals(req.OwnerDepartmentId)))
	}

	optionalParams = append(optionalParams, db.DigitalEntitlement.TotalQuantity.Set(req.TotalQuantity))
	optionalParams = append(optionalParams, db.DigitalEntitlement.AutoRenew.Set(req.AutoRenew))
	optionalParams = append(optionalParams, db.DigitalEntitlement.RenewalPeriodMonths.Set(req.RenewalPeriodMonths))

	return database.Client.DigitalEntitlement.CreateOne(
		db.DigitalEntitlement.Code.Set(req.Code),
		db.DigitalEntitlement.Name.Set(req.Name),
		db.DigitalEntitlement.Type.Set(db.DigitalEntitlementType(req.Type)),
		db.DigitalEntitlement.Creator.Link(db.User.ID.Equals(creatorID)),
		optionalParams...,
	).Exec(ctx)
}

func (s *DigitalService) ListEntitlements(ctx context.Context, entType string) ([]db.DigitalEntitlementModel, error) {
	var filters []db.DigitalEntitlementWhereParam
	if entType != "" {
		filters = append(filters, db.DigitalEntitlement.Type.Equals(db.DigitalEntitlementType(entType)))
	}
	
	return database.Client.DigitalEntitlement.FindMany(filters...).
		OrderBy(db.DigitalEntitlement.ExpiryDate.Order(db.SortOrderAsc)).
		Exec(ctx)
}

func (s *DigitalService) GetEntitlement(ctx context.Context, id string) (*db.DigitalEntitlementModel, error) {
	return database.Client.DigitalEntitlement.FindUnique(
		db.DigitalEntitlement.ID.Equals(id),
	).With(
		db.DigitalEntitlement.Assignments.Fetch().OrderBy(db.DigitalAssignment.AssignedAt.Order(db.SortOrderDesc)),
		db.DigitalEntitlement.Renewals.Fetch().OrderBy(db.DigitalRenewal.RenewalDate.Order(db.SortOrderDesc)),
	).Exec(ctx)
}

func (s *DigitalService) AssignEntitlement(ctx context.Context, entitlementId string, actorId string, req dto.AssignEntitlementRequest) (*db.DigitalAssignmentModel, error) {
	// 1. Check entitlement exists and has available quantity
	entitlement, err := database.Client.DigitalEntitlement.FindUnique(db.DigitalEntitlement.ID.Equals(entitlementId)).Exec(ctx)
	if err != nil {
		return nil, errors.New("không tìm thấy bản quyền")
	}

	// Calculate assigned quantity
	activeAssignments, err := database.Client.DigitalAssignment.FindMany(
		db.DigitalAssignment.EntitlementID.Equals(entitlementId),
		db.DigitalAssignment.Status.Equals(db.DigitalAssignmentStatusActive),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	assignedQty := 0
	for _, a := range activeAssignments {
		assignedQty += a.Quantity
	}

	if assignedQty+req.Quantity > entitlement.TotalQuantity {
		return nil, errors.New("số lượng bản quyền khả dụng không đủ")
	}

	var optionalParams []db.DigitalAssignmentSetParam
	if req.PersonId != "" {
		optionalParams = append(optionalParams, db.DigitalAssignment.Person.Link(db.Person.ID.Equals(req.PersonId)))
	}
	if req.AssetId != "" {
		optionalParams = append(optionalParams, db.DigitalAssignment.Asset.Link(db.Asset.ID.Equals(req.AssetId)))
	}
	if req.DepartmentId != "" {
		optionalParams = append(optionalParams, db.DigitalAssignment.Department.Link(db.Department.ID.Equals(req.DepartmentId)))
	}
	if req.AssignmentNote != "" {
		optionalParams = append(optionalParams, db.DigitalAssignment.AssignmentNote.Set(req.AssignmentNote))
	}

	optionalParams = append(optionalParams, db.DigitalAssignment.Quantity.Set(req.Quantity))

	// 2. Create Assignment
	return database.Client.DigitalAssignment.CreateOne(
		db.DigitalAssignment.Entitlement.Link(db.DigitalEntitlement.ID.Equals(entitlementId)),
		db.DigitalAssignment.Actor.Link(db.User.ID.Equals(actorId)),
		optionalParams...,
	).Exec(ctx)
}

func (s *DigitalService) RevokeAssignment(ctx context.Context, assignmentId string, actorId string, reason string) error {
	_, err := database.Client.DigitalAssignment.FindUnique(
		db.DigitalAssignment.ID.Equals(assignmentId),
	).Update(
		db.DigitalAssignment.Status.Set(db.DigitalAssignmentStatusRevoked),
		db.DigitalAssignment.RevokedAt.Set(time.Now()),
		db.DigitalAssignment.Revoker.Link(db.User.ID.Equals(actorId)),
		db.DigitalAssignment.RevokeReason.Set(reason),
	).Exec(ctx)
	return err
}

func (s *DigitalService) RenewEntitlement(ctx context.Context, entitlementId string, actorId string, req dto.RenewEntitlementRequest) (*db.DigitalRenewalModel, error) {
	// 1. Get entitlement to get previous expiry date
	entitlement, err := database.Client.DigitalEntitlement.FindUnique(db.DigitalEntitlement.ID.Equals(entitlementId)).Exec(ctx)
	if err != nil {
		return nil, errors.New("không tìm thấy bản quyền")
	}

	expiry, ok := entitlement.ExpiryDate()
	if !ok {
		return nil, errors.New("bản quyền này không có ngày hết hạn cũ")
	}

	// 2. Use a transaction to create renewal and update entitlement
	// Note: Since prisma-client-go transactions can be tricky with types, we'll do it sequentially for simplicity in this implementation
	
	// Create renewal record
	var optionalParams []db.DigitalRenewalSetParam
	if req.Amount != nil {
		optionalParams = append(optionalParams, db.DigitalRenewal.Amount.Set(decimal.NewFromFloat(*req.Amount)))
	}
	if req.Currency != "" {
		optionalParams = append(optionalParams, db.DigitalRenewal.Currency.Set(req.Currency))
	}
	if req.PurchaseOrderNo != "" {
		optionalParams = append(optionalParams, db.DigitalRenewal.PurchaseOrderNo.Set(req.PurchaseOrderNo))
	}
	if req.InvoiceNo != "" {
		optionalParams = append(optionalParams, db.DigitalRenewal.InvoiceNo.Set(req.InvoiceNo))
	}
	if req.Notes != "" {
		optionalParams = append(optionalParams, db.DigitalRenewal.Notes.Set(req.Notes))
	}

	renewal, err := database.Client.DigitalRenewal.CreateOne(
		db.DigitalRenewal.PreviousExpiryDate.Set(expiry),
		db.DigitalRenewal.NewExpiryDate.Set(req.NewExpiryDate),
		db.DigitalRenewal.Entitlement.Link(db.DigitalEntitlement.ID.Equals(entitlementId)),
		db.DigitalRenewal.Actor.Link(db.User.ID.Equals(actorId)),
		optionalParams...,
	).Exec(ctx)

	if err != nil {
		return nil, err
	}

	// Update entitlement expiry date
	_, err = database.Client.DigitalEntitlement.FindUnique(
		db.DigitalEntitlement.ID.Equals(entitlementId),
	).Update(
		db.DigitalEntitlement.ExpiryDate.Set(req.NewExpiryDate),
	).Exec(ctx)

	if err != nil {
		return nil, err
	}

	return renewal, nil
}
