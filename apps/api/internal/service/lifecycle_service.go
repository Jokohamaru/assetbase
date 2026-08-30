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

func (s *LifecycleService) ReturnAsset(ctx context.Context, assetID string, actorID string, req dto.ReturnAssetRequest) (*db.AssetReturnModel, error) {
	// Find Asset
	asset, err := database.Client.Asset.FindUnique(db.Asset.ID.Equals(assetID)).Exec(ctx)
	if err != nil {
		return nil, errors.New("asset not found")
	}

	// Find Open Assignment
	assignment, err := database.Client.AssetAssignment.FindFirst(
		db.AssetAssignment.AssetID.Equals(assetID),
		db.AssetAssignment.Status.Equals(db.AssetAssignmentStatusOpen),
	).Exec(ctx)
	if err != nil {
		return nil, errors.New("no active assignment found for this asset")
	}

	// Map Outcome
	outcome := db.AssetReturnOutcomeReady
	// To do this properly, we need to query AssetStatus by Code
	statusCode := ""
	if req.Outcome == "READY" {
		outcome = db.AssetReturnOutcomeReady
		statusCode = "READY"
	} else if req.Outcome == "MAINTENANCE" {
		outcome = db.AssetReturnOutcomeMaintenance
		statusCode = "MAINTENANCE"
	} else if req.Outcome == "BROKEN" {
		outcome = db.AssetReturnOutcomeBroken
		statusCode = "BROKEN"
	}

	// Find the correct status from DB
	status, err := database.Client.AssetStatus.FindFirst(db.AssetStatus.Code.Equals(statusCode)).Exec(ctx)
	if err != nil {
		return nil, errors.New("invalid status outcome")
	}

	// Close Assignment
	_, err = database.Client.AssetAssignment.FindUnique(db.AssetAssignment.ID.Equals(assignment.ID)).Update(
		db.AssetAssignment.Status.Set(db.AssetAssignmentStatusClosed),
	).Exec(ctx)

	// Create Return
	returnRecord, err := database.Client.AssetReturn.CreateOne(
		db.AssetReturn.ReturnNo.Set("RTN-"+asset.AssetTag),
		db.AssetReturn.ConditionIn.Set(req.ConditionIn),
		db.AssetReturn.Outcome.Set(outcome),
		db.AssetReturn.Assignment.Link(db.AssetAssignment.ID.Equals(assignment.ID)),
		db.AssetReturn.Asset.Link(db.Asset.ID.Equals(assetID)),
		db.AssetReturn.Location.Link(db.Location.ID.Equals(req.LocationId)),
		db.AssetReturn.Actor.Link(db.User.ID.Equals(actorID)),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	// Update Asset
	_, err = database.Client.Asset.FindUnique(db.Asset.ID.Equals(assetID)).Update(
		db.Asset.Location.Link(db.Location.ID.Equals(req.LocationId)),
		db.Asset.Status.Link(db.AssetStatus.ID.Equals(status.ID)),
		db.Asset.AssignedUser.Unlink(),
		db.Asset.CurrentCustodian.Unlink(),
		db.Asset.Department.Unlink(),
	).Exec(ctx)

	// Create History
	_, _ = database.Client.AssetHistory.CreateOne(
		db.AssetHistory.Action.Set(db.AssetHistoryActionReturned),
		db.AssetHistory.Description.Set("Asset returned"),
		db.AssetHistory.Asset.Link(db.Asset.ID.Equals(asset.ID)),
		db.AssetHistory.Actor.Link(db.User.ID.Equals(actorID)),
	).Exec(ctx)

	return returnRecord, nil
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
