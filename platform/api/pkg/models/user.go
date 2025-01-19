package models

type User struct {
	ID               uint
	Name             string `json:"name,omitempty"`
	AvailableCourses []*UsersCourse
	Email            string
	Password         string `json:"password,omitempty"`
}
