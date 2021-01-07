package server

import (
)



// UserSummary returns general information about a user. It pulls in information from multiple places (properties, expenses, 
// historical data, etc.)
type UserSummary struct {
	Properties *PropertiesSummary `json:"properties_summary,omitempty"`
	Expenses *ExpensesSummary `json:"expenses_summary,omitempty"`
}

func (s *Server) calculateUserSummary(userID string) (*UserSummary, error) {

	propertiesSummary, err := s.calculatePropertiesAnalysis(userID, nil, nil)
	if err != nil {
		return nil, err
	}

	expensesSummary, err := s.calculateExpensesAnalysis(userID)
	if err != nil {
		return nil, err
	}

	return &UserSummary{
		Properties: propertiesSummary,
		Expenses: expensesSummary,
	}, nil
}