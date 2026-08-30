package service

import (
	"context"
	"errors"

	"github.com/Jokohamaru/assetbase/internal/database"
	"github.com/Jokohamaru/assetbase/internal/dto"
	"github.com/Jokohamaru/assetbase/prisma/db"
)

type LifecycleService struct{}

func NewLifecycleService() *LifecycleService {
	return &LifecycleService{}
}

func (s *LifecycleService) AssignAsset(ctx context.Context, assetID string, actorID string, req dto.AssignAssetRequest) (*db.AssetAssignmentModel, error) {
	// Find Asset
	asset, err := database.Client.Asset.FindUnique(db.Asset.ID.Equals(assetID)).Exec(ctx)
	if err != nil {
		return nil, errors.New("asset not found")
	}

	// We should check if it's assignable based on status, but let's assume it is for now.

	assignType := db.AssetAssignmentTypeAssignment
	if req.Type == "LOAN" {
		assignType = db.AssetAssignmentTypeLoan
	}

	// Create Assignment
	assignment, err := database.Client.AssetAssignment.CreateOne(
		db.AssetAssignment.AssignmentNo.Set("ASN-"+asset.AssetTag), // Should generate a unique one in real app
		db.AssetAssignment.Type.Set(assignType),
		db.AssetAssignment.ConditionOut.Set(req.ConditionOut),
		db.AssetAssignment.Asset.Link(db.Asset.ID.Equals(assetID)),
		db.AssetAssignment.AssignedTo.Link(db.Person.ID.Equals(req.AssignedToId)),
		db.AssetAssignment.Department.Link(db.Department.ID.Equals(req.DepartmentId)),
		db.AssetAssignment.Location.Link(db.Location.ID.Equals(req.LocationId)),
		db.AssetAssignment.Actor.Link(db.User.ID.Equals(actorID)),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	// Update Asset
	_, err = database.Client.Asset.FindUnique(db.Asset.ID.Equals(assetID)).Update(
		db.Asset.Department.Link(db.Department.ID.Equals(req.DepartmentId)),
		db.Asset.Location.Link(db.Location.ID.Equals(req.LocationId)),
		// statusId should be changed to 'ASSIGNED' normally
	).Exec(ctx)

	// Create History
	_, _ = database.Client.AssetHistory.CreateOne(
		db.AssetHistory.Action.Set(db.AssetHistoryActionAssigned),
		db.AssetHistory.Description.Set("Asset assigned"),
		db.AssetHistory.Asset.Link(db.Asset.ID.Equals(asset.ID)),
		db.AssetHistory.Actor.Link(db.User.ID.Equals(actorID)),
	).Exec(ctx)

	return assignment, nil
}

func (s *LifecycleService) TransferAsset(ctx context.Context, assetID string, actorID string, req dto.TransferAssetRequest) (*db.AssetTransferModel, error) {
	asset, err := database.Client.Asset.FindUnique(db.Asset.ID.Equals(assetID)).Exec(ctx)
	if err != nil {
		return nil, errors.New("asset not found")
	}

	transfer, err := database.Client.AssetTransfer.CreateOne(
		db.AssetTransfer.TransferNo.Set("TRF-"+asset.AssetTag),
		db.AssetTransfer.Reason.Set(req.Reason),
		db.AssetTransfer.Asset.Link(db.Asset.ID.Equals(assetID)),
		db.AssetTransfer.ToLocation.Link(db.Location.ID.Equals(req.ToLocationId)),
		db.AssetTransfer.Actor.Link(db.User.ID.Equals(actorID)),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	_, err = database.Client.Asset.FindUnique(db.Asset.ID.Equals(assetID)).Update(
		db.Asset.Location.Link(db.Location.ID.Equals(req.ToLocationId)),
	).Exec(ctx)

	_, _ = database.Client.AssetHistory.CreateOne(
		db.AssetHistory.Action.Set(db.AssetHistoryActionTransferred),
		db.AssetHistory.Description.Set("Asset transferred"),
		db.AssetHistory.Asset.Link(db.Asset.ID.Equals(asset.ID)),
		db.AssetHistory.Actor.Link(db.User.ID.Equals(actorID)),
	).Exec(ctx)

	return transfer, nil
}
