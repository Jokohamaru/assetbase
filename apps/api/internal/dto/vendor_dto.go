package dto

type CreateVendorRequest struct {
	Code           string `json:"code" binding:"required"`
	Name           string `json:"name" binding:"required"`
	TaxCode        string `json:"taxCode"`
	Category       string `json:"category" binding:"required"`
	Contact        string `json:"contact" binding:"required"`
	Email          string `json:"email" binding:"omitempty,email"`
	Phone          string `json:"phone"`
	Address        string `json:"address"`
	Certifications string `json:"certifications"`
	Status         string `json:"status" binding:"required"`
	Notes          string `json:"notes"`
}

type UpdateVendorRequest struct {
	Name           string `json:"name"`
	TaxCode        string `json:"taxCode"`
	Category       string `json:"category"`
	Contact        string `json:"contact"`
	Email          string `json:"email"`
	Phone          string `json:"phone"`
	Address        string `json:"address"`
	Certifications string `json:"certifications"`
	Status         string `json:"status"`
	Notes          string `json:"notes"`
}

type EvaluateVendorRequest struct {
	Scores map[string]int `json:"scores" binding:"required"` // e.g. {"SLA": 5, "Quality": 4, "Price": 4}
}
