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

type RiskService struct{}

func NewRiskService() *RiskService {
	return &RiskService{}
}

// CalculateScore calculates risk score and level
// Level mapping: 1-4: LOW, 5-9: MEDIUM, 10-16: HIGH, 17-25: CRITICAL
func CalculateScore(likelihood, impact int) (int, db.RiskLevel) {
	score := likelihood * impact
	var level db.RiskLevel
	if score <= 4 {
		level = db.RiskLevelLow
	} else if score <= 9 {
		level = db.RiskLevelMedium
	} else if score <= 16 {
		level = db.RiskLevelHigh
	} else {
		level = db.RiskLevelCritical
	}
	return score, level
}

// Risk Assessments

func (s *RiskService) CreateAssessment(ctx context.Context, req dto.CreateRiskAssessmentRequest, createdBy string) (*db.RiskAssessmentModel, error) {
	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		return nil, errors.New("ngày bắt đầu không hợp lệ (YYYY-MM-DD)")
	}

	assessmentNo := fmt.Sprintf("RA-%s", time.Now().Format("20060102-150405"))

	var optionalParams []db.RiskAssessmentSetParam
	if req.Description != "" {
		optionalParams = append(optionalParams, db.RiskAssessment.Description.Set(req.Description))
	}
	if req.TargetDate != "" {
		targetDate, _ := time.Parse("2006-01-02", req.TargetDate)
		optionalParams = append(optionalParams, db.RiskAssessment.TargetDate.Set(targetDate))
	}
	if req.DepartmentID != "" {
		optionalParams = append(optionalParams, db.RiskAssessment.Department.Link(db.Department.ID.Equals(req.DepartmentID)))
	}
	if req.Methodology != "" {
		optionalParams = append(optionalParams, db.RiskAssessment.Methodology.Set(req.Methodology))
	}

	return database.Client.RiskAssessment.CreateOne(
		db.RiskAssessment.AssessmentNo.Set(assessmentNo),
		db.RiskAssessment.Title.Set(req.Title),
		db.RiskAssessment.Scope.Set(req.Scope),
		db.RiskAssessment.StartDate.Set(startDate),
		db.RiskAssessment.Owner.Link(db.User.ID.Equals(req.OwnerID)),
		db.RiskAssessment.Creator.Link(db.User.ID.Equals(createdBy)),
		optionalParams...,
	).Exec(ctx)
}

func (s *RiskService) ListAssessments(ctx context.Context) ([]db.RiskAssessmentModel, error) {
	return database.Client.RiskAssessment.FindMany().
		OrderBy(db.RiskAssessment.CreatedAt.Order(db.SortOrderDesc)).
		With(
			db.RiskAssessment.Owner.Fetch(),
		).Exec(ctx)
}

func (s *RiskService) GetAssessment(ctx context.Context, id string) (*db.RiskAssessmentModel, error) {
	return database.Client.RiskAssessment.FindUnique(
		db.RiskAssessment.ID.Equals(id),
	).With(
		db.RiskAssessment.Owner.Fetch(),
		db.RiskAssessment.Approver.Fetch(),
		db.RiskAssessment.Risks.Fetch().With(
			db.RiskItem.Owner.Fetch(),
		),
	).Exec(ctx)
}

func (s *RiskService) UpdateAssessmentStatus(ctx context.Context, id string, status db.RiskAssessmentStatus) (*db.RiskAssessmentModel, error) {
	return database.Client.RiskAssessment.FindUnique(
		db.RiskAssessment.ID.Equals(id),
	).Update(
		db.RiskAssessment.Status.Set(status),
	).Exec(ctx)
}

// Risk Items

func (s *RiskService) CreateRiskItem(ctx context.Context, assessmentID string, req dto.CreateRiskItemRequest, createdBy string) (*db.RiskItemModel, error) {
	// Check if assessment exists
	assessment, err := database.Client.RiskAssessment.FindUnique(db.RiskAssessment.ID.Equals(assessmentID)).Exec(ctx)
	if err != nil || assessment == nil {
		return nil, errors.New("không tìm thấy phiên đánh giá rủi ro")
	}

	riskNo := fmt.Sprintf("RSK-%s", time.Now().Format("20060102-150405"))
	score, level := CalculateScore(req.Likelihood, req.Impact)

	var optionalParams []db.RiskItemSetParam
	if req.ExistingControls != "" {
		optionalParams = append(optionalParams, db.RiskItem.ExistingControls.Set(req.ExistingControls))
	}
	if req.DueDate != "" {
		dueDate, _ := time.Parse("2006-01-02", req.DueDate)
		optionalParams = append(optionalParams, db.RiskItem.DueDate.Set(dueDate))
	}
	if req.DepartmentID != "" {
		optionalParams = append(optionalParams, db.RiskItem.Department.Link(db.Department.ID.Equals(req.DepartmentID)))
	}

	return database.Client.RiskItem.CreateOne(
		db.RiskItem.RiskNo.Set(riskNo),
		db.RiskItem.Title.Set(req.Title),
		db.RiskItem.Category.Set(req.Category),
		db.RiskItem.Scenario.Set(req.Scenario),
		db.RiskItem.Threat.Set(req.Threat),
		db.RiskItem.Vulnerability.Set(req.Vulnerability),
		db.RiskItem.Likelihood.Set(req.Likelihood),
		db.RiskItem.Impact.Set(req.Impact),
		db.RiskItem.InherentScore.Set(score),
		db.RiskItem.InherentLevel.Set(level),
		db.RiskItem.Assessment.Link(db.RiskAssessment.ID.Equals(assessmentID)),
		db.RiskItem.Owner.Link(db.User.ID.Equals(req.OwnerID)),
		db.RiskItem.Creator.Link(db.User.ID.Equals(createdBy)),
		optionalParams...,
	).Exec(ctx)
}

func (s *RiskService) UpdateRiskTreatment(ctx context.Context, id string, req dto.UpdateRiskTreatmentRequest) (*db.RiskItemModel, error) {
	var optionalParams []db.RiskItemSetParam
	optionalParams = append(optionalParams, db.RiskItem.TreatmentStrategy.Set(req.TreatmentStrategy))
	
	if req.Status != "" {
		optionalParams = append(optionalParams, db.RiskItem.Status.Set(req.Status))
	}
	if req.AcceptanceRationale != "" {
		optionalParams = append(optionalParams, db.RiskItem.AcceptanceRationale.Set(req.AcceptanceRationale))
	}

	// Calculate residual score if provided
	if req.ResidualLikelihood > 0 && req.ResidualImpact > 0 {
		rScore, rLevel := CalculateScore(req.ResidualLikelihood, req.ResidualImpact)
		optionalParams = append(optionalParams,
			db.RiskItem.ResidualLikelihood.Set(req.ResidualLikelihood),
			db.RiskItem.ResidualImpact.Set(req.ResidualImpact),
			db.RiskItem.ResidualScore.Set(rScore),
			db.RiskItem.ResidualLevel.Set(rLevel),
		)
	}

	return database.Client.RiskItem.FindUnique(
		db.RiskItem.ID.Equals(id),
	).Update(
		optionalParams...,
	).Exec(ctx)
}
