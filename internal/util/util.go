package util

import (
	"strconv"
	"strings"
	"time"
)

func GetYear(date string) int {
	dateSpl := strings.Split(date, "-")
	year, err := strconv.Atoi(dateSpl[0])
	if err != nil {
		// If we are unable to return the year, set the current year.
		y := time.Now().Year()
		return y
	}
	return year
}