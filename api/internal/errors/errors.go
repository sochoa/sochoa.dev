package errors

// ValidationError represents a validation failure
type ValidationError struct {
	Message string
}

func (e ValidationError) Error() string {
	return e.Message
}

// NotFoundError represents a resource not found
type NotFoundError struct {
	Message string
}

func (e NotFoundError) Error() string {
	return e.Message
}

// UnauthorizedError represents an authentication failure
type UnauthorizedError struct {
	Message string
}

func (e UnauthorizedError) Error() string {
	return e.Message
}

// ForbiddenError represents an authorization failure
type ForbiddenError struct {
	Message string
}

func (e ForbiddenError) Error() string {
	return e.Message
}
