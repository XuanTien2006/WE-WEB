npm run build
pm2 delete VTL
pm2 start npm --name "VTL" -- start
pm2 ls
