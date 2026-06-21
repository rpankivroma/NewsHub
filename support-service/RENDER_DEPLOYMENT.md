# Render Deployment Guide for NewsHub Support Service

## Prerequisites
- Render account (https://render.com)
- GitHub repository with this code
- External managed services (PostgreSQL, Kafka)

## Environment Variables to Configure in Render

Set these in your Render service's **Environment** settings:

### Required Variables (set as secrets):
- `DATABASE_URL`: PostgreSQL connection string for support service database
- `MAIN_DATABASE_URL`: PostgreSQL connection string for main database
- `JWT_SECRET`: Your JWT signing secret (should be different from local dev)
- `BREVO_API_KEY`: Brevo email API key
- `KAFKA_BOOTSTRAP_SERVERS`: External Kafka broker address (e.g., `kafka.example.com:9092`)
- `FRONTEND_URL`: Frontend application URL

### Optional Variables:
- `JWT_ALGORITHM`: (default: `HS256`)
- `PORT`: (default: `8000`) — Render sets this automatically

## Deployment Steps

### 1. Create a Web Service
1. Go to Render Dashboard → **New +** → **Web Service**
2. Connect your GitHub repository
3. Set **Name**: `newshub-support-service`
4. Set **Runtime**: `Docker`
5. Set **Build Command**: (leave empty, uses Dockerfile.prod)
6. Set **Start Command**: (leave empty, uses CMD from Dockerfile.prod)
7. Set **Instance Type**: Choose based on load (Starter is ~$7/mo)
8. Add all **Environment Variables** listed above

### 2. Add Environment Variables
1. Click **Advanced** → **Environment Variables**
2. Add each variable as:
   - **Key**: Variable name
   - **Value**: Your value (or leave blank for Render secrets)
3. For secrets, click the lock icon or use Render secrets manager

### 3. Configure Health Check (Optional but Recommended)
Render auto-detects healthchecks from Dockerfile HEALTHCHECK instruction.

### 4. Deploy
- Click **Create Web Service**
- Render will:
  1. Clone your repo
  2. Build Docker image using `Dockerfile.prod`
  3. Deploy container with exposed port 8000
  4. Run healthchecks

## For Kafka/Zookeeper

### Option A: External Managed Kafka
Use a managed Kafka service (Confluent Cloud, AWS MSK, Upstash):
- Set `KAFKA_BOOTSTRAP_SERVERS` to external broker
- No additional Render config needed

### Option B: Self-Managed Kafka on Render
1. Create a second **Background Worker** service
2. Use `Dockerfile.kafka` for Kafka container
3. Set Kafka connection details
4. Link services via internal network (requires Render Pro)

**Recommended**: Use managed Kafka (Option A) for production simplicity.

## Monitoring & Logs

- View logs: Render Dashboard → Service → **Logs** tab
- Monitor health: **Metrics** tab shows CPU, memory, requests
- Set up alerts: **Notifications** → Configure email alerts

## Scaling

- **Instance Type**: Upgrade for more CPU/RAM
- **Auto-scaling**: Not available on free tier; upgrade to Pro
- **Replicas**: Add more instances (Pro plan)

## Cost Estimation

- Web Service (Starter): ~$7/mo
- External PostgreSQL (e.g., Neon): ~$0/mo-$5/mo
- External Kafka (e.g., Upstash): ~$0/mo-$20/mo
- **Total**: ~$7-32/mo depending on usage

## Troubleshooting

### Service won't start
- Check logs: **Logs** tab
- Verify all required env vars are set
- Ensure `KAFKA_BOOTSTRAP_SERVERS` is reachable

### Health check failing
- Check if `/health` endpoint exists in FastAPI app
- Verify dependencies (Kafka, PostgreSQL) are reachable
- Increase `start_period` in Dockerfile HEALTHCHECK if needed

### Build failures
- Check build logs
- Ensure all dependencies are in `requirements.txt`
- Verify Dockerfile.prod is correct

## Important Security Notes

1. **Never commit `.env`** — use Render's environment variables
2. **Rotate `JWT_SECRET`** in production
3. **Use database credentials** from managed PostgreSQL (not hardcoded)
4. **Enable HTTPS** — Render provides automatic SSL
5. **Set `FRONTEND_URL`** to your actual frontend domain

## Post-Deployment

After deployment is live:
1. Test endpoints: `curl https://<your-render-url>/docs`
2. Monitor logs for errors
3. Set up uptime monitoring (Render Monitoring or third-party)
4. Configure auto-deploy on GitHub push
