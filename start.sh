pm2 start -f --ignore-watch "*.log tests " --watch --name "watermark" './dist/app.js' --node-args="--nolazy --inspect=7001" -- --appPort 20002 --logLevel debug

