package services

type Hasher interface {
	Hash(password string) (string, error)
	Compare(password string, hash string) error
}
