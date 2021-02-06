package external

import (
	"../db"
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
	Components *LobResponseComponents `json:"componenets,omitempty"`
}

// LobResponseComponents represents the "components" field of the LobAPI Response.
type LobResponseComponents struct {
	City string `json:"city,omitempty"`
	State string `json:"state,omitempty"`
	ZipCode string `json:"zip_code,omitempty"`
	ZipCodePluseFour string `json:"zip_code_plus_four,omitempty"`
}

// ValidateAddress will return the USPS CASS standardized address.
func ValidateAddress(property db.Property) (*LobAddress, error) {

	addressRequestURL := fmt.Sprintf("%s/v1/us_verifications/", lobEndpoint)

	resp, err := http.Post(propertyRequestURL)
	if err != nil {
		return err
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	var lobResponse LobResponse 
	err = json.Unmarshal(body, &lobResponse)
	if err != nil {
		return err
	}

	var addressOne, addressTwo, city, state, zip string
	if lobResponse.PrimaryLine != "" {
		addressOne = lobResponse.PrimaryLine
	} else {
		addressOne = property.
	}

	if lobResponse.SecondaryLine != "" {
		addressTwo = lobResponse.SecondaryLine
	}

	if lobResponse.Components != nil {
		if lobResponse.Components.City != "" {
			city = lobResponse.Components.City
		}
		if lobResponse.Components.State != "" {
			state = lobResponse.Components.State
		}
		if lobResponse.Componenets.ZipCode != "" && lobResponse.Components.ZipCodePlusFour != "" {
			zip = lobResponse.Components.ZipCode + " " + lobResponse.Components.ZipCodePlusFour
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