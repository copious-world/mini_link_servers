afile=$1
output=/media/richard/ELEMENTS/data/blog/
indir=/media/richard/ELEMENTS/writing/
keys='nuts,buts,huts,putz'
subject="a random subject about something"
node data_placer.js $output $indir$afile ${keys} "$subject"
