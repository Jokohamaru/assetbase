package dto

import "time"

type CreateIncidentRequest struct {
	Title                string `json:"title" binding:"required"`
	Category             string `json:"category" binding:"required"` // IncidentCategory
	Priority             string `json:"priority" binding:"required"` // IncidentPriority
	Impact               string `json:"impact" binding:"required"` // IncidentImpact
	Urgency              string `json:"urgency" binding:"required"` // IncidentUrgency
	Description          string `json:"description" binding:"required"`
	ReporterName         string `json:"reporterName" binding:"required"`
	ReporterContact      string `json:"reporterContact"`
	ReportedById         string `json:"reportedById,omitempty"`
	AssignedToId         string `json:"assignedToId,omitempty"`
	DepartmentId         string `json:"departmentId,omitempty"`
	AssignedDepartmentId string `json:"assignedDepartmentId,omitempty"`
	LocationId           string `json:"locationId,omitempty"`
	AssetId              string `json:"assetId,omitempty"`
	IsSecurityIncident   bool   `json:"isSecurityIncident"`
}

type UpdateIncidentStatusRequest struct {
	Status           string `json:"status" binding:"required"` // IncidentStatus
	Note             string `json:"note" binding:"required"`
	BusinessImpact   string `json:"businessImpact,omitempty"`
	Resolution       string `json:"resolution,omitempty"`
	RootCause        string `json:"rootCause,omitempty"`
	CorrectiveAction string `json:"correctiveAction,omitempty"`
	PreventiveAction string `json:"preventiveAction,omitempty"`
	LessonsLearned   string `json:"lessonsLearned,omitempty"`
	DowntimeMinutes  int    `json:"downtimeMinutes,omitempty"`
	AffectedUsers    int    `json:"affectedUsers,omitempty"`
}

type AssignIncidentRequest struct {
	AssignedToId string `json:"assignedToId" binding:"required"`
	DepartmentId string `json:"departmentId" binding:"required"`
	Note         string `json:"note"`
}

type IncidentActivityResponse struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"`
	Note        string    `json:"note"`
	FromStatus  string    `json:"fromStatus,omitempty"`
	ToStatus    string    `json:"toStatus,omitempty"`
	PerformedBy string    `json:"performedBy"`
	CreatedAt   time.Time `json:"createdAt"`
}

type IncidentResponse struct {
	ID                   string                     `json:"id"`
	IncidentNo           string                     `json:"incidentNo"`
	Title                string                     `json:"title"`
	Category             string                     `json:"category"`
	Status               string                     `json:"status"`
	Priority             string                     `json:"priority"`
	Impact               string                     `json:"impact"`
	Urgency              string                     `json:"urgency"`
	Description          string                     `json:"description"`
	ReporterName         string                     `json:"reporterName"`
	ReportedAt           time.Time                  `json:"reportedAt"`
	SlaResponseDueAt     time.Time                  `json:"slaResponseDueAt"`
	SlaResolutionDueAt   time.Time                  `json:"slaResolutionDueAt"`
	ResponseStartedAt    *time.Time                 `json:"responseStartedAt,omitempty"`
	ResolvedAt           *time.Time                 `json:"resolvedAt,omitempty"`
	ClosedAt             *time.Time                 `json:"closedAt,omitempty"`
	AssignedToId         *string                    `json:"assignedToId,omitempty"`
	AssignedDepartmentId *string                    `json:"assignedDepartmentId,omitempty"`
	Activities           []IncidentActivityResponse `json:"activities,omitempty"`
}
