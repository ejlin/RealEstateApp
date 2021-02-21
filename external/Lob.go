package external

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"../internal/db"
)

const (
	// See https://docs.lob.com/#us_verifications.
	lobEndpoint = "https://api.lob.com/"
)

// LobAddress is the address returned by the Lob API.
type LobAddress struct {
	AddressLineOne string `json:"address_line1,omitempty"`
	AddressLineTwo string `json:"address_line2,omitempty"`
	AddressCity string `json:"address_city,omitempty"`
	AddressState string `json:"address_state,omitempty"`
	AddressZip string `json:"address_zip,omitempty"`
}

// LobResponse is the response returned by the Lob API.
type LobResponse struct {
	PrimaryLine string `json:"primary_line,omitempty"`
	SecondaryLine string `json:"secondary_line,omitempty"`
	Components *LobResponseComponents `json:"components,omitempty"`
}

// LobResponseComponents represents the "components" field of the LobAPI Response.
type LobResponseComponents struct {
	City string `json:"city,omitempty"`
	State string `json:"state,omitempty"`
	ZipCode string `json:"zip_code,omitempty"`
	ZipCodePlusFour string `json:"zip_code_plus_four,omitempty"`
}

// ValidateAddress will return the USPS CASS standardized address.
func ValidateAddress(property db.Property, apiKey string) (*LobAddress, error) {

	addressRequestURL := fmt.Sprintf("%sv1/us_verifications/", lobEndpoint)
	requestBody, err := json.Marshal(map[string]string{
		"primary_line": property.AddressOne,
		"city": property.City,
		"state": property.State,
		"zip_code": property.ZipCode,
	})
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", addressRequestURL, bytes.NewBuffer(requestBody))
	if err != nil {
		return nil, err
	}

	req.SetBasicAuth(apiKey, "")

	client := &http.Client{}
    resp, err := client.Do(req)

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var lobResponse LobResponse 
	err = json.Unmarshal(body, &lobResponse)
	if err != nil {
		return nil, err
	}

	var addressOne, addressTwo, city, state, zip string
	if lobResponse.PrimaryLine != "" {
		addressOne = lobResponse.PrimaryLine
	} else {
		addressOne = property.AddressOne
	}

	if lobResponse.SecondaryLine != "" {
		addressTwo = lobResponse.SecondaryLine
	} else {
		addressTwo = property.AddressTwo
	}

	if lobResponse.Components != nil {
		if lobResponse.Components.City != "" {
			city = lobResponse.Components.City
		} else {
			city = property.City
		}
		if lobResponse.Components.State != "" {
			state = lobResponse.Components.State
		} else {
			state = property.State
		}
		if lobResponse.Components.ZipCode != "" && lobResponse.Components.ZipCodePlusFour != "" {
			zip = lobResponse.Components.ZipCode + " " + lobResponse.Components.ZipCodePlusFour
		} else {
			zip = property.ZipCode
		}
	}

	return &LobAddress{
		AddressLineOne: addressOne,
		AddressLineTwo: addressTwo,
		AddressCity: city,
		AddressState: state,
		AddressZip: zip,
	}, nil
	
}