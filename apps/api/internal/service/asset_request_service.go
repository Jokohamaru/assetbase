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

type AssetRequestService struct{}

func NewAssetRequestService() *AssetRequestService {
	return &AssetRequestService{}
}

// CreateAssetRequest creates a new asset request from user
func (s *AssetRequestService) CreateAssetRequest(ctx context.Context, userID string, req dto.CreateAssetRequestRequest) (*db.AssetRequestModel, error) {
	category, err := database.Client.AssetCategory.FindUnique(
		db.AssetCategory.ID.Equals(req.AssetCategoryId),
	).Exec(ctx)
	if err != nil {
		return nil, errors.New("asset category not found")
	}

	requestNo := fmt.Sprintf("REQ-%d", time.Now().UnixMilli())

	request, err := database.Client.AssetRequest.CreateOne(
		db.AssetRequest.RequestNo.Set(requestNo),
		db.AssetRequest.Requester.Link(db.User.ID.Equals(userID)),
		db.AssetRequest.AssetCategory.Link(db.AssetCategory.ID.Equals(category.ID)),
		db.AssetRequest.Purpose.Set(req.Purpose),
		db.AssetRequest.Description.Set(req.Description),
		db.AssetRequest.Status.Set(db.AssetRequestStatusPending),
	).Exec(ctx)

	if err != nil {
		return nil, err
	}

	return request, nil
}

// ListMyAssetRequests returns a paginated list of asset requests made by the user
func (s *AssetRequestService) ListMyAssetRequests(ctx context.Context, userID string, page int, limit int) (*dto.AssetRequestListResponse, error) {
	skip := (page - 1) * limit

	requests, err := database.Client.AssetRequest.FindMany(
		db.AssetRequest.RequestedBy.Equals(userID),
	).
		With(
			db.AssetRequest.Requester.Fetch(),
			db.AssetRequest.AssetCategory.Fetch(),
		).
		OrderBy(db.AssetRequest.CreatedAt.Order(db.SortOrderDesc)).
		Skip(skip).
		Take(limit).
		Exec(ctx)

	if err != nil {
		return nil, err
	}

	allRequests, err := database.Client.AssetRequest.FindMany(db.AssetRequest.RequestedBy.Equals(userID)).Exec(ctx)
	if err != nil {
		return nil, err
	}
	total := len(allRequests)

	var responses []dto.AssetRequestResponse
	for _, req := range requests {
		responses = append(responses, mapToAssetRequestResponse(&req))
	}

	return &dto.AssetRequestListResponse{
		Data:  responses,
		Total: total,
		Page:  page,
		Limit: limit,
	}, nil
}

// GetAssetRequest returns a single asset request by ID
func (s *AssetRequestService) GetAssetRequest(ctx context.Context, id string) (*dto.AssetRequestResponse, error) {
	req, err := database.Client.AssetRequest.FindUnique(
		db.AssetRequest.ID.Equals(id),
	).With(
		db.AssetRequest.Requester.Fetch(),
		db.AssetRequest.AssetCategory.Fetch(),
	).Exec(ctx)
	if err != nil {
		return nil, errors.New("asset request not found")
	}

	res := mapToAssetRequestResponse(req)
	return &res, nil
}

// CancelAssetRequest cancels a pending request by the requester
func (s *AssetRequestService) CancelAssetRequest(ctx context.Context, id string, userID string) (*db.AssetRequestModel, error) {
	req, err := database.Client.AssetRequest.FindUnique(
		db.AssetRequest.ID.Equals(id),
	).Exec(ctx)
	if err != nil {
		return nil, errors.New("asset request not found")
	}

	if req.RequestedBy != userID {
		return nil, errors.New("you can only cancel your own requests")
	}

	if req.Status != db.AssetRequestStatusPending {
		return nil, errors.New("only pending requests can be cancelled")
	}

	updated, err := database.Client.AssetRequest.FindUnique(
		db.AssetRequest.ID.Equals(id),
	).Update(
		db.AssetRequest.Status.Set(db.AssetRequestStatusCancelled),
	).Exec(ctx)

	return updated, err
}

// ListAllAssetRequests for admin, with optional status filter
func (s *AssetRequestService) ListAllAssetRequests(ctx context.Context, page int, limit int, status *string) (*dto.AssetRequestListResponse, error) {
	skip := (page - 1) * limit

	var whereParams []db.AssetRequestWhereParam
	if status != nil && *status != "" {
		whereParams = append(whereParams, db.AssetRequest.Status.Equals(db.AssetRequestStatus(*status)))
	}

	requests, err := database.Client.AssetRequest.FindMany(whereParams...).
		With(
			db.AssetRequest.Requester.Fetch(),
			db.AssetRequest.AssetCategory.Fetch(),
		).
		OrderBy(db.AssetRequest.CreatedAt.Order(db.SortOrderDesc)).
		Skip(skip).
		Take(limit).
		Exec(ctx)

	if err != nil {
		return nil, err
	}

	allRequests, err := database.Client.AssetRequest.FindMany(whereParams...).Exec(ctx)
	if err != nil {
		return nil, err
	}
	total := len(allRequests)

	var responses []dto.AssetRequestResponse
	for _, req := range requests {
		responses = append(responses, mapToAssetRequestResponse(&req))
	}

	return &dto.AssetRequestListResponse{
		Data:  responses,
		Total: total,
		Page:  page,
		Limit: limit,
	}, nil
}

// ApproveAssetRequest approves a pending request
func (s *AssetRequestService) ApproveAssetRequest(ctx context.Context, id string, adminID string) (*db.AssetRequestModel, error) {
	req, err := database.Client.AssetRequest.FindUnique(
		db.AssetRequest.ID.Equals(id),
	).Exec(ctx)
	if err != nil {
		return nil, errors.New("asset request not found")
	}

	if req.Status != db.AssetRequestStatusPending {
		return nil, errors.New("only pending requests can be approved")
	}

	updated, err := database.Client.AssetRequest.FindUnique(
		db.AssetRequest.ID.Equals(id),
	).Update(
		db.AssetRequest.Status.Set(db.AssetRequestStatusApproved),
		db.AssetRequest.Approver.Link(db.User.ID.Equals(adminID)),
		db.AssetRequest.ApprovedAt.Set(time.Now()),
	).Exec(ctx)

	return updated, err
}

// RejectAssetRequest rejects a request
func (s *AssetRequestService) RejectAssetRequest(ctx context.Context, id string, adminID string, reason string) (*db.AssetRequestModel, error) {
	req, err := database.Client.AssetRequest.FindUnique(
		db.AssetRequest.ID.Equals(id),
	).Exec(ctx)
	if err != nil {
		return nil, errors.New("asset request not found")
	}

	if req.Status != db.AssetRequestStatusPending && req.Status != db.AssetRequestStatusApproved {
		return nil, errors.New("only pending or approved requests can be rejected")
	}

	updated, err := database.Client.AssetRequest.FindUnique(
		db.AssetRequest.ID.Equals(id),
	).Update(
		db.AssetRequest.Status.Set(db.AssetRequestStatusRejected),
		db.AssetRequest.Approver.Link(db.User.ID.Equals(adminID)),
		db.AssetRequest.ApprovedAt.Set(time.Now()),
		db.AssetRequest.RejectionReason.Set(reason),
	).Exec(ctx)

	return updated, err
}

// FulfillAssetRequest fulfills an approved request by assigning an asset
func (s *AssetRequestService) FulfillAssetRequest(ctx context.Context, id string, adminID string, payload dto.FulfillAssetRequestRequest) (*db.AssetRequestModel, error) {
	// 1. Validate request
	req, err := database.Client.AssetRequest.FindUnique(
		db.AssetRequest.ID.Equals(id),
	).Exec(ctx)
	if err != nil {
		return nil, errors.New("asset request not found")
	}

	if req.Status != db.AssetRequestStatusApproved {
		return nil, errors.New("only approved requests can be fulfilled")
	}

	// 2. Find requester's Person record
	person, err := database.Client.Person.FindFirst(
		db.Person.LinkedUserID.Equals(req.RequestedBy),
	).Exec(ctx)
	if err != nil || person == nil {
		return nil, errors.New("người yêu cầu chưa có hồ sơ nhân sự (Person record) trong hệ thống")
	}

	// 3. Find Asset
	asset, err := database.Client.Asset.FindUnique(
		db.Asset.ID.Equals(payload.AssetId),
	).With(
		db.Asset.Status.Fetch(),
	).Exec(ctx)
	if err != nil {
		return nil, errors.New("asset not found")
	}

	if asset.Status().Code != "READY" {
		return nil, errors.New("asset must be in READY status to be assigned")
	}

	// 4. Resolve location
	locationId, ok := person.LocationID()
	if !ok {
		loc, ok2 := asset.LocationID()
		if !ok2 {
			return nil, errors.New("cannot determine location for assignment")
		}
		locationId = loc
	}

	// 5. Create AssetAssignment
	assignmentNo := fmt.Sprintf("ASN-%s-%d", asset.AssetTag, time.Now().UnixMilli())
	assignment, err := database.Client.AssetAssignment.CreateOne(
		db.AssetAssignment.AssignmentNo.Set(assignmentNo),
		db.AssetAssignment.Type.Set(db.AssetAssignmentTypeAssignment),
		db.AssetAssignment.ConditionOut.Set(payload.ConditionOut),
		db.AssetAssignment.Asset.Link(db.Asset.ID.Equals(payload.AssetId)),
		db.AssetAssignment.AssignedTo.Link(db.Person.ID.Equals(person.ID)),
		db.AssetAssignment.Department.Link(db.Department.ID.Equals(person.DepartmentID)),
		db.AssetAssignment.Location.Link(db.Location.ID.Equals(locationId)),
		db.AssetAssignment.Actor.Link(db.User.ID.Equals(adminID)),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create assignment: %v", err)
	}

	// 6. Update Asset Status & Custodian
	inUseStatus, err := database.Client.AssetStatus.FindFirst(
		db.AssetStatus.Code.Equals("IN_USE"),
	).Exec(ctx)
	if err != nil {
		return nil, errors.New("system error: IN_USE status not found")
	}

	_, err = database.Client.Asset.FindUnique(
		db.Asset.ID.Equals(payload.AssetId),
	).Update(
		db.Asset.Status.Link(db.AssetStatus.ID.Equals(inUseStatus.ID)),
		db.Asset.CurrentCustodian.Link(db.Person.ID.Equals(person.ID)),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to update asset: %v", err)
	}

	// 7. Update AssetRequest
	updatedReq, err := database.Client.AssetRequest.FindUnique(
		db.AssetRequest.ID.Equals(id),
	).Update(
		db.AssetRequest.Status.Set(db.AssetRequestStatusFulfilled),
		db.AssetRequest.Assignment.Link(db.AssetAssignment.ID.Equals(assignment.ID)),
		db.AssetRequest.Fulfiller.Link(db.User.ID.Equals(adminID)),
		db.AssetRequest.FulfilledAt.Set(time.Now()),
	).Exec(ctx)

	return updatedReq, err
}

func mapToAssetRequestResponse(m *db.AssetRequestModel) dto.AssetRequestResponse {
	resp := dto.AssetRequestResponse{
		ID:              m.ID,
		RequestNo:       m.RequestNo,
		Status:          string(m.Status),
		Purpose:         m.Purpose,
		Description:     m.Description,
		AssetCategoryId: m.AssetCategoryID,
		RequestedBy:     m.RequestedBy,
		CreatedAt:       m.CreatedAt,
	}

	if cat := m.AssetCategory(); cat != nil {
		resp.AssetCategory = cat.Name
	}
	if req := m.Requester(); req != nil {
		resp.RequestedByName = req.FullName
	}
	
	if val, ok := m.ApprovedAt(); ok {
		resp.ApprovedAt = &val
	}
	if val, ok := m.RejectionReason(); ok {
		resp.RejectionReason = &val
	}
	if val, ok := m.FulfilledAt(); ok {
		resp.FulfilledAt = &val
	}
	if val, ok := m.AssignmentID(); ok {
		resp.AssignmentId = &val
	}

	return resp
}
