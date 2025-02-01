package database

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Course represents the main course structure
type Course struct {
	ID          uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()" json:"id,omitempty"`
	Title       string    `gorm:"not null" json:"title,omitempty"`
	Name        string    `gorm:"unique;not null" json:"name,omitempty"`
	Description string    `gorm:"type:text" json:"description,omitempty"`
	Category    string    `json:"category,omitempty"`
	Difficulty  string    `json:"difficulty,omitempty"`
	Modules     []*Module `gorm:"foreignKey:CourseID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"modules,omitempty"`
}

// Module represents a module within a course
type Module struct {
	ID          uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4()" json:"id,omitempty"`
	Title       string     `gorm:"not null" json:"title,omitempty"`
	Name        string     `gorm:"not null" json:"name,omitempty"`
	Description string     `gorm:"type:text" json:"description,omitempty"`
	Order       int        `gorm:"" json:"order,omitempty"`
	CourseID    uuid.UUID  `gorm:"not null" json:"course_id,omitempty"`
	Lectures    []*Lecture `gorm:"foreignKey:ModuleID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"lectures,omitempty"`
	Tasks       []*Task    `gorm:"foreignKey:ModuleID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"tasks,omitempty"`
	Quizzes     []*Quiz    `gorm:"foreignKey:ModuleID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"quizzes,omitempty"`
}

// Lecture represents a lecture within a module
type Lecture struct {
	ID       uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()" json:"id,omitempty"`
	Order    int       `gorm:"" json:"order,omitempty"`
	Title    string    `gorm:"not null" json:"title,omitempty"`
	Name     string    `gorm:"not null" json:"name,omitempty"`
	ModuleID uuid.UUID `gorm:"not null" json:"module_id,omitempty"`
	Content  string    `gorm:"type:text" json:"content,omitempty"` // Text content loaded from file
}

// Task represents a task within a module
type Task struct {
	ID       uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()"`
	Order    int       `gorm:"" json:"order,omitempty"`
	Title    string    `gorm:"not null"`
	Name     string    `gorm:"not null"`
	ModuleID uuid.UUID `gorm:"not null"`
	Manifest string    `gorm:"type:text"`
	Readme   string    `gorm:"type:text"` // Readme content loaded from file
	Validate string    `gorm:"type:text"` // Validation script loaded from file
}

// Quiz represents a quiz within a module
type Quiz struct {
	ID        uuid.UUID   `gorm:"type:uuid;default:uuid_generate_v4()" json:"id,omitempty"`
	Order     int         `gorm:"" json:"order,omitempty"`
	Title     string      `gorm:"not null" json:"title,omitempty"`
	Name      string      `gorm:"not null" json:"name,omitempty"`
	ModuleID  uuid.UUID   `gorm:"not null" json:"module_id,omitempty"`
	Questions []*Question `gorm:"foreignKey:QuizID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"questions,omitempty"`
}

// Question represents a question within a quiz
type Question struct {
	ID      uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()" json:"id,omitempty"`
	Order   int       `gorm:"" json:"order,omitempty"`
	Type    string    `gorm:"not null" json:"type,omitempty"`
	Text    string    `gorm:"type:text;not null" json:"text,omitempty"`
	QuizID  uuid.UUID `gorm:"not null" json:"quiz_id,omitempty"`
	Options []*Option `gorm:"foreignKey:QuestionID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"options,omitempty"`
	Right   string    `gorm:"type:text" json:"right,omitempty"` // For text-based answers
}

// Option represents an option for a multiple-choice question
type Option struct {
	ID         uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()" json:"id,omitempty"`
	Option     string    `gorm:"type:text;not null" json:"option,omitempty"`
	IsRight    bool      `gorm:"default:false" json:"is_right,omitempty"`
	QuestionID uuid.UUID `gorm:"not null" json:"question_id,omitempty"`
}

// User represents a user in the system
type User struct {
	ID          uuid.UUID     `gorm:"type:uuid;default:uuid_generate_v4()"`
	Name        string        `gorm:"not null"`
	Email       string        `gorm:"unique;not null"`
	Enrollments []*Enrollment `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

// Enrollment represents a user's enrollment in a course
type Enrollment struct {
	ID       uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()"`
	UserID   uuid.UUID `gorm:"not null"`
	CourseID uuid.UUID `gorm:"not null"`
	Course   Course
	Progress []*Progress `gorm:"foreignKey:EnrollmentID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

// Progress represents the progress of a user in a specific module, lecture, task, or quiz
type Progress struct {
	ID           uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()"`
	EnrollmentID uuid.UUID `gorm:"not null"`
	LectureID    *uuid.UUID
	TaskID       *uuid.UUID
	QuizID       *uuid.UUID
	Status       string `gorm:"not null"` // e.g., "not_started", "in_progress", "completed"
}

// Migrate function to auto-migrate all the tables
func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&Course{},
		&Module{},
		&Lecture{},
		&Task{},
		&Quiz{},
		&Question{},
		&Option{},
		&User{},
		&Enrollment{},
		&Progress{},
	)
}
