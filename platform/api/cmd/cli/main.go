package main

import (
	"context"
	"log"
	"os"
	"path/filepath"

	"github.com/urfave/cli/v3"
)

func main() {
	cmd := &cli.Command{
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:    "host",
				Aliases: []string{"H"},
				Usage:   "host address",
				Value:   "http://learnops.local",
			},
			&cli.StringFlag{
				Name:    "token-path",
				Aliases: []string{""},
				Usage:   "path of file with tokens",
				Value:   "oidc_token.json",
			},
		},
		Commands: []*cli.Command{
			{
				Name:  "upload",
				Usage: "upload courses",
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:    "config",
						Aliases: []string{"c"},
						Usage:   "config path",
					},
				},
				Action: func(ctx context.Context, cmd *cli.Command) error {
					config, err := filepath.Abs(cmd.String("config"))
					if err != nil {
						return err
					}
					course := ParseCourse(config)
					course.EnrichFiles()
					course.Upload(cmd)
					return nil
				},
			},
			{
				Name:  "assign",
				Usage: "assign user to course",
				Flags: []cli.Flag{
					&cli.StringSliceFlag{
						Name:    "course",
						Aliases: []string{"c"},
						Usage:   "course name",
					},
					&cli.StringFlag{
						Name:    "user",
						Aliases: []string{"u"},
						Usage:   "username",
					},
				},
				Action: func(ctx context.Context, cmd *cli.Command) error {
					AssignCoursesToUser(cmd)
					return nil
				},
			},
			LoginCommand(),
		},
	}

	if err := cmd.Run(context.Background(), os.Args); err != nil {
		log.Fatal(err)
	}
}
