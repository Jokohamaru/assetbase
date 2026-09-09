package service

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/Jokohamaru/assetbase/internal/database"
	"github.com/Jokohamaru/assetbase/internal/dto"
	"github.com/Jokohamaru/assetbase/prisma/db"
)

type IncidentService struct{}

func NewIncidentService() *IncidentService {
	return &IncidentService{}
}

func (s *IncidentService) CreateIncident(ctx context.Context, creatorID string, req dto.CreateIncidentRequest) (*db.IncidentModel, error) {
	now := time.Now()
	
	// Default SLA calculation based on Priority
	var responseSLA, resolutionSLA time.Duration
	switch db.IncidentPriority(req.Priority) {
	case db.IncidentPriorityP1:
		responseSLA = 15 * time.Minute
		resolutionSLA = 4 * time.Hour
	case db.IncidentPriorityP2:
		responseSLA = 1 * time.Hour
		resolutionSLA = 8 * time.Hour
	case db.IncidentPriorityP3:
		responseSLA = 4 * time.Hour
		resolutionSLA = 24 * time.Hour
	case db.IncidentPriorityP4:
		responseSLA = 8 * time.Hour
		resolutionSLA = 72 * time.Hour
	default:
		responseSLA = 4 * time.Hour
		resolutionSLA = 24 * time.Hour
	}

	slaResponseDueAt := now.Add(responseSLA)
	slaResolutionDueAt := now.Add(resolutionSLA)

	// Generate a unique Incident No (e.g. INC-YYYYMMDD-HHMMSS)
	incidentNo := fmt.Sprintf("INC-%s", now.Format("20060102-150405"))

	var optionalParams []db.IncidentSetParam
	if req.ReportedById != "" {
		optionalParams = append(optionalParams, db.Incident.Reporter.Link(db.User.ID.Equals(req.ReportedById)))
	}
	if req.ReporterContact != "" {
		optionalParams = append(optionalParams, db.Incident.ReporterContact.Set(req.ReporterContact))
	}
	if req.AssetId != "" {
		optionalParams = append(optionalParams, db.Incident.Asset.Link(db.Asset.ID.Equals(req.AssetId)))
	}
	if req.LocationId != "" {
		optionalParams = append(optionalParams, db.Incident.Location.Link(db.Location.ID.Equals(req.LocationId)))
	}
	if req.DepartmentId != "" {
		optionalParams = append(optionalParams, db.Incident.Department.Link(db.Department.ID.Equals(req.DepartmentId)))
	}
	if req.IsSecurityIncident {
		optionalParams = append(optionalParams, db.Incident.IsSecurityIncident.Set(true))
	}
	if req.TicketType != "" {
		optionalParams = append(optionalParams, db.Incident.TicketType.Set(db.TicketType(req.TicketType)))
	} else {
		optionalParams = append(optionalParams, db.Incident.TicketType.Set(db.TicketTypeIncident))
	}
	if req.RequestDetails != nil {
		b, err := json.Marshal(req.RequestDetails)
		if err == nil {
			optionalParams = append(optionalParams, db.Incident.RequestDetails.Set(b))
		}
	}

	incident, err := database.Client.Incident.CreateOne(
		db.Incident.IncidentNo.Set(incidentNo),
		db.Incident.Title.Set(req.Title),
		db.Incident.Category.Set(db.IncidentCategory(req.Category)),
		db.Incident.Priority.Set(db.IncidentPriority(req.Priority)),
		db.Incident.Impact.Set(db.IncidentImpact(req.Impact)),
		db.Incident.Urgency.Set(db.IncidentUrgency(req.Urgency)),
		db.Incident.Description.Set(req.Description),
		db.Incident.ReporterName.Set(req.ReporterName),
		db.Incident.DetectedAt.Set(now), // For simplicity
		db.Incident.SlaResponseDueAt.Set(slaResponseDueAt),
		db.Incident.SlaResolutionDueAt.Set(slaResolutionDueAt),
		db.Incident.Creator.Link(db.User.ID.Equals(creatorID)),
		optionalParams...,
	).Exec(ctx)

	if err != nil {
		return nil, err
	}

	// Create initial activity log
	_, _ = database.Client.IncidentActivity.CreateOne(
		db.IncidentActivity.Type.Set("CREATED"),
		db.IncidentActivity.Note.Set("Sự cố được ghi nhận trên hệ thống"),
		db.IncidentActivity.Incident.Link(db.Incident.ID.Equals(incident.ID)),
		db.IncidentActivity.Actor.Link(db.User.ID.Equals(creatorID)),
		db.IncidentActivity.ToStatus.Set(db.IncidentStatusNew),
	).Exec(ctx)

	return incident, nil
}

func (s *IncidentService) ListIncidents(ctx context.Context, status string, ticketType string, my bool, userID string) ([]db.IncidentModel, error) {
	var filters []db.IncidentWhereParam
	if status != "" {
		filters = append(filters, db.Incident.Status.Equals(db.IncidentStatus(status)))
	}
	if ticketType != "" {
		filters = append(filters, db.Incident.TicketType.Equals(db.TicketType(ticketType)))
	}
	if my {
		filters = append(filters, db.Incident.Creator.Where(db.User.ID.Equals(userID)))
	}
	return database.Client.Incident.FindMany(filters...).
		OrderBy(db.Incident.ReportedAt.Order(db.SortOrderDesc)).
		Exec(ctx)
}

func (s *IncidentService) GetIncident(ctx context.Context, id string) (*db.IncidentModel, error) {
	return database.Client.Incident.FindUnique(
		db.Incident.ID.Equals(id),
	).With(
		db.Incident.Activities.Fetch().OrderBy(db.IncidentActivity.CreatedAt.Order(db.SortOrderDesc)),
		db.Incident.Assignments.Fetch().OrderBy(db.IncidentAssignment.CreatedAt.Order(db.SortOrderDesc)),
		db.Incident.Assignee.Fetch(),
	).Exec(ctx)
}

func (s *IncidentService) UpdateStatus(ctx context.Context, id string, actorID string, req dto.UpdateIncidentStatusRequest) (*db.IncidentModel, error) {
	incident, err := database.Client.Incident.FindUnique(db.Incident.ID.Equals(id)).Exec(ctx)
	if err != nil {
		return nil, err
	}

	newStatus := db.IncidentStatus(req.Status)
	now := time.Now()

	var updateParams []db.IncidentSetParam
	updateParams = append(updateParams, db.Incident.Status.Set(newStatus))

	if req.Resolution != "" {
		updateParams = append(updateParams, db.Incident.Resolution.Set(req.Resolution))
	}
	if req.RootCause != "" {
		updateParams = append(updateParams, db.Incident.RootCause.Set(req.RootCause))
	}

	// Update SLA timestamp based on status transition
	_, hasResponse := incident.ResponseStartedAt()
	_, hasResolved := incident.ResolvedAt()
	_, hasClosed := incident.ClosedAt()

	if newStatus == db.IncidentStatusInProgress && !hasResponse {
		updateParams = append(updateParams, db.Incident.ResponseStartedAt.Set(now))
	} else if newStatus == db.IncidentStatusResolved && !hasResolved {
		updateParams = append(updateParams, db.Incident.ResolvedAt.Set(now))
	} else if newStatus == db.IncidentStatusClosed && !hasClosed {
		updateParams = append(updateParams, db.Incident.ClosedAt.Set(now))
	}

	updated, err := database.Client.Incident.FindUnique(
		db.Incident.ID.Equals(id),
	).Update(
		updateParams...,
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	_, _ = database.Client.IncidentActivity.CreateOne(
		db.IncidentActivity.Type.Set("STATUS_CHANGE"),
		db.IncidentActivity.Note.Set(req.Note),
		db.IncidentActivity.Incident.Link(db.Incident.ID.Equals(incident.ID)),
		db.IncidentActivity.Actor.Link(db.User.ID.Equals(actorID)),
		db.IncidentActivity.FromStatus.Set(incident.Status),
		db.IncidentActivity.ToStatus.Set(newStatus),
	).Exec(ctx)

	return updated, nil
}

func (s *IncidentService) AssignIncident(ctx context.Context, id string, actorID string, req dto.AssignIncidentRequest) (*db.IncidentModel, error) {
	incident, err := database.Client.Incident.FindUnique(db.Incident.ID.Equals(id)).Exec(ctx)
	if err != nil {
		return nil, err
	}

	// Update incident
	updated, err := database.Client.Incident.FindUnique(
		db.Incident.ID.Equals(id),
	).Update(
		db.Incident.Assignee.Link(db.User.ID.Equals(req.AssignedToId)),
		db.Incident.AssignedDepartment.Link(db.Department.ID.Equals(req.DepartmentId)),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	// Create Assignment record
	_, _ = database.Client.IncidentAssignment.CreateOne(
		db.IncidentAssignment.Incident.Link(db.Incident.ID.Equals(incident.ID)),
		db.IncidentAssignment.Assignee.Link(db.User.ID.Equals(req.AssignedToId)),
		db.IncidentAssignment.Department.Link(db.Department.ID.Equals(req.DepartmentId)),
		db.IncidentAssignment.Actor.Link(db.User.ID.Equals(actorID)),
		db.IncidentAssignment.Note.Set(req.Note),
	).Exec(ctx)

	// Create Activity
	_, _ = database.Client.IncidentActivity.CreateOne(
		db.IncidentActivity.Type.Set("ASSIGNMENT"),
		db.IncidentActivity.Note.Set("Đã chuyển giao sự cố cho kỹ thuật viên mới"),
		db.IncidentActivity.Incident.Link(db.Incident.ID.Equals(incident.ID)),
		db.IncidentActivity.Actor.Link(db.User.ID.Equals(actorID)),
	).Exec(ctx)

	return updated, nil
}

func (s *IncidentService) FulfillIncident(ctx context.Context, incidentId string, adminID string, payload dto.FulfillIncidentRequest) (*db.IncidentModel, error) {
	// 1. Validate request
	incident, err := database.Client.Incident.FindUnique(
		db.Incident.ID.Equals(incidentId),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("incident not found")
	}

	if incident.TicketType != db.TicketTypeServiceRequest {
		return nil, fmt.Errorf("only SERVICE_REQUEST can be fulfilled")
	}
	
	// Assuming an APPROVED status exists or we just check if it's not closed
	if incident.Status == db.IncidentStatusClosed || incident.Status == db.IncidentStatusResolved || incident.Status == db.IncidentStatusCancelled {
		return nil, fmt.Errorf("cannot fulfill a closed or resolved request")
	}

	// 2. Find requester's Person record
	person, err := database.Client.Person.FindFirst(
		db.Person.LinkedUserID.Equals(incident.CreatedByID),
	).Exec(ctx)
	if err != nil || person == nil {
		return nil, fmt.Errorf("người yêu cầu chưa có hồ sơ nhân sự (Person record) trong hệ thống")
	}

	// 3. Find Asset
	asset, err := database.Client.Asset.FindUnique(
		db.Asset.ID.Equals(payload.AssetId),
	).With(
		db.Asset.Status.Fetch(),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("asset not found")
	}

	if asset.Status().Code != "READY" {
		return nil, fmt.Errorf("asset must be in READY status to be assigned")
	}

	// 4. Resolve location
	locationId, ok := person.LocationID()
	if !ok {
		loc, ok2 := asset.LocationID()
		if !ok2 {
			return nil, fmt.Errorf("cannot determine location for assignment")
		}
		locationId = loc
	}

	// 5. Create AssetAssignment
	assignmentNo := fmt.Sprintf("ASN-%s-%d", asset.AssetTag, time.Now().UnixMilli())
	_, err = database.Client.AssetAssignment.CreateOne(
		db.AssetAssignment.AssignmentNo.Set(assignmentNo),
		db.AssetAssignment.Type.Set(db.AssetAssignmentTypeAssignment),
		db.AssetAssignment.ConditionOut.Set(payload.ConditionOut),
		db.AssetAssignment.Asset.Link(db.Asset.ID.Equals(payload.AssetId)),
		db.AssetAssignment.AssignedTo.Link(db.Person.ID.Equals(person.ID)),
		db.AssetAssignment.Department.Link(db.Department.ID.Equals(person.DepartmentID)),
		db.AssetAssignment.Location.Link(db.Location.ID.Equals(locationId)),
		db.AssetAssignment.Actor.Link(db.User.ID.Equals(adminID)),
		db.AssetAssignment.Incident.Link(db.Incident.ID.Equals(incident.ID)),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create assignment: %v", err)
	}

	// 6. Create AssetHistory (CRITICAL FIX)
	_, _ = database.Client.AssetHistory.CreateOne(
		db.AssetHistory.Action.Set(db.AssetHistoryActionAssigned),
		db.AssetHistory.Description.Set("Asset assigned to fulfill Service Request "+incident.IncidentNo),
		db.AssetHistory.Asset.Link(db.Asset.ID.Equals(payload.AssetId)),
		db.AssetHistory.Actor.Link(db.User.ID.Equals(adminID)),
	).Exec(ctx)

	// 7. Update Asset Status & Custodian
	inUseStatus, err := database.Client.AssetStatus.FindFirst(
		db.AssetStatus.Code.Equals("IN_USE"),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("system error: IN_USE status not found")
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

	now := time.Now()
	// 8. Update Incident
	updatedReq, err := database.Client.Incident.FindUnique(
		db.Incident.ID.Equals(incidentId),
	).Update(
		db.Incident.Status.Set(db.IncidentStatusResolved),
		db.Incident.ResolvedAt.Set(now),
	).Exec(ctx)
	
	// 9. Create IncidentActivity
	_, _ = database.Client.IncidentActivity.CreateOne(
		db.IncidentActivity.Type.Set("FULFILLED"),
		db.IncidentActivity.Note.Set(fmt.Sprintf("Đã cấp phát tài sản %s (Tag: %s) để giải quyết yêu cầu. Ghi chú: %s", asset.Name, asset.AssetTag, payload.Note)),
		db.IncidentActivity.Incident.Link(db.Incident.ID.Equals(incident.ID)),
		db.IncidentActivity.Actor.Link(db.User.ID.Equals(adminID)),
		db.IncidentActivity.FromStatus.Set(incident.Status),
		db.IncidentActivity.ToStatus.Set(db.IncidentStatusResolved),
	).Exec(ctx)

	return updatedReq, err
}

func (s *IncidentService) AddActivity(ctx context.Context, incidentID string, actorID string, req dto.AddIncidentActivityRequest) (*db.IncidentActivityModel, error) {
	incident, err := database.Client.Incident.FindUnique(db.Incident.ID.Equals(incidentID)).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("incident not found")
	}

	activity, err := database.Client.IncidentActivity.CreateOne(
		db.IncidentActivity.Type.Set(req.Type),
		db.IncidentActivity.Note.Set(req.Note),
		db.IncidentActivity.Incident.Link(db.Incident.ID.Equals(incident.ID)),
		db.IncidentActivity.Actor.Link(db.User.ID.Equals(actorID)),
	).Exec(ctx)

	return activity, err
}
