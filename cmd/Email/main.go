package main

import (
  "bytes"
  "fmt"
  "net/smtp"
  "text/template"
)

func main() {

	// Sender data.
	from := "ejlin1996@gmail.com"
	password := "cwbgftgjvglcbkme"

	// Receiver email address.
	to := []string{
		"tgih1999@gmail.com",
	}

	// smtp server configuration.
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	// Authentication.
	auth := smtp.PlainAuth("", from, password, smtpHost)

	t, _ := template.ParseFiles("/Users/eric.lin/Documents/RealEstateApp/cmd/Email/verify_email_template.html")

	body := bytes.Buffer{}

	mimeHeaders := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	body.Write([]byte(fmt.Sprintf("Subject: This is a test subject \n%s\n\n", mimeHeaders)))

	t.Execute(&body, struct {
		Name    string
		Message string
		}{
		Name:    "Eric Lin",
		Message: "This is a test message in a HTML template",
	})

	// Sending email.
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, to, body.Bytes())
	if err != nil {
	fmt.Println(err)
	return
	}
	fmt.Println("Email Sent!")
}