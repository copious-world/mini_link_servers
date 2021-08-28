PROD=$1
if [ -z '$PROD' ]; then
echo "production"
else
open ./test-config/config_blog_server.conf
open ./test-config/config_demo_server.conf
open ./test-config/config_stream_server.conf
fi
