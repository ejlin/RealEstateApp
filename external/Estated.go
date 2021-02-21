package external

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings" 

	"../internal/db"

)

const (
	estatedAPIURL = "https://apis.estated.com/v4/property"
)

type EstatedAPIResponse struct {
	Data EstatedAPIData	`json:"data,omitempty"`
	Metadata EstatedAPIMetadata `json:"metadata,omitempty"`
	Warnings []EstatedAPIWarning	`json:"warnings,omitempty"`
}

type EstatedAPIData struct {
	Parcel EstatedAPIDataParcel `json:"parcel,omitempty"`
	Structure EstatedAPIDataStructure `json:"structure,omitempty"`
	Valuation EstatedAPIDataValuation `json:"valuation,omitempty"`
}

type EstatedAPIDataParcel struct {
	AreaSqFt int `json:"area_sq_ft"`
}

type EstatedAPIDataStructure struct {
	NumBeds int `json:"beds_count"`
	NumBaths float64 `json:"baths"`
}

type EstatedAPIDataValuation struct {
	Value int `json:"value,omitempty"`
}

type EstatedAPIMetadata struct {

}

type EstatedAPIWarning struct {

}

func GetEstatedProperty(property *db.Property, apiKey string) (*EstatedAPIResponse , error) {

	estatedRequestURL := fmt.Sprintf("%s?token=%s", estatedAPIURL, apiKey)

	address := property.AddressOne + property.AddressTwo

	propertyRequestURL := fmt.Sprintf("%s&street_address=%s&city=%s&state=%s&zip_code=%s", estatedRequestURL, address, property.City, property.State, property.ZipCode)
	propertyRequestURL = strings.Replace(propertyRequestURL, " ", "+", -1)

	resp, err := http.Get(propertyRequestURL)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var estatedResponse EstatedAPIResponse 
	err = json.Unmarshal(body, &estatedResponse)
	if err != nil {
		return nil, err
	}

	return &estatedResponse, nil
}

