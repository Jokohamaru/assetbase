package service

import (
	"context"
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

func (s *IncidentService) ListIncidents(ctx context.Context, status string) ([]db.IncidentModel, error) {
	var filters []db.IncidentWhereParam
	if status != "" {
		filters = append(filters, db.Incident.Status.Equals(db.IncidentStatus(status)))
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
	if newStatus == db.IncidentStatusInProgress && incident.ResponseStartedAt == nil {
		updateParams = append(updateParams, db.Incident.ResponseStartedAt.Set(now))
	} else if newStatus == db.IncidentStatusResolved && incident.ResolvedAt == nil {
		updateParams = append(updateParams, db.Incident.ResolvedAt.Set(now))
	} else if newStatus == db.IncidentStatusClosed && incident.ClosedAt == nil {
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
