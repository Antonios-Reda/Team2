# BoniCare Recovery Procedures

## 1. Automatic Rollback
Triggered by Jenkins upon health check failure. No manual action required.

## 2. Manual Rollback
If Jenkins is down, execute the following from the jump server:
`ansible-playbook -i inventory/prod.ini rollback_logic.yml -e "previous_image_tag=v1.2.0"`

## 3. Database Recovery
If database connection fails post-deployment:
1. Check container health: `docker ps | grep mongodb`
2. Check logs: `docker logs mongodb`
3. Restore from last automated snapshot: `mongorestore --archive=/backups/prod-latest.gz`

## 4. Communication
All failures trigger an alert in the #devops-alerts Slack channel.