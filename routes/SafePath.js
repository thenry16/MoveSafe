exports.view = function(req, res){
    res.render('safePath', {
        'start': '',
        'destination' : '',
        'image': 'PlaceHolderSafePath.png'
    });
};
