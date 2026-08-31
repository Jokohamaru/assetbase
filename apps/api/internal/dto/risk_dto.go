package dto

import "github.com/Jokohamaru/assetbase/prisma/db"

type CreateRiskAssessmentRequest struct {
	Title        string `json:"title" binding:"required"`
	Description  string `json:"description"`
	Scope        string `json:"scope" binding:"required"`
	Methodology  string `json:"methodology" binding:"required"`
	DepartmentID string `json:"departmentId"`
	StartDate    string `json:"startDate" binding:"required"` // YYYY-MM-DD
	TargetDate   string `json:"targetDate"`
	OwnerID      string `json:"ownerId" binding:"required"`
}

type UpdateRiskAssessmentStatusRequest struct {
	Status db.RiskAssessmentStatus `json:"status" binding:"required"`
}

type CreateRiskItemRequest struct {
	Title            string `json:"title" binding:"required"`
	Category         string `json:"category" binding:"required"`
	Scenario         string `json:"scenario" binding:"required"`
	Threat           string `json:"threat" binding:"required"`
	Vulnerability    string `json:"vulnerability" binding:"required"`
	ExistingControls string `json:"existingControls"`
	Likelihood       int    `json:"likelihood" binding:"required,min=1,max=5"`
	Impact           int    `json:"impact" binding:"required,min=1,max=5"`
	OwnerID          string `json:"ownerId" binding:"required"`
	DepartmentID     string `json:"departmentId"`
	DueDate          string `json:"dueDate"`
}

type UpdateRiskTreatmentRequest struct {
	TreatmentStrategy   db.RiskTreatmentStrategy `json:"treatmentStrategy" binding:"required"`
	AcceptanceRationale string                   `json:"acceptanceRationale"`
	ResidualLikelihood  int                      `json:"residualLikelihood"`
	ResidualImpact      int                      `json:"residualImpact"`
	Status              db.RiskItemStatus        `json:"status"`
}
