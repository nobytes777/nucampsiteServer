const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');


const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .populate('user')
    .populate('campsites')
    .then((favorite) => {
        if(favorite) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
        }
    })
    .catch(err => next(err));
})
.post(
    cors.corsWithOptions, 
    authenticate.verifyUser, 
    (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    if (favorite) {
        req.body.foreach((campsite) => {
            if(!favorite.campsites.includes(campsite._id)) {
                favorite.campsites.push(campsite._id)
            }
        });
        favorite.save()    
        .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        })
    .catch(err => next(err))
} else {
    Favorite.create({ user: req.user._id })
    .then((favorite) => {
        req.body.forEach((campsite) => {
            favorite.campsites.push(campsite._id)
        });
        favorite.save().then((favorite) => {
            console.log('Favorite Created ', favorite);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        })
    .catch(err => next(err))
    })

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    favorite.findOneAndDelete({ user: req.user._id })
    .then((favorite) => {
        res.statusCode = 200;
        if(favorite) {
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        } else {
            res.setHeader("Content-Type", "text/plain")
            res.end('You do not have any favorites to delete.')
        }
    })
    .catch(err => next(err))
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/:campsiteId');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne({ user: req.user._id })
        .then((favorite) => {
            res.statusCode = 200;
            if (favorite) {
                if(!favorite.campsites.includes(req.param.campsiteId)) {
                favorite.campsites.push(req.param.campsiteId);
                favorite
                .save()    
                .then((favorite) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            } else {
            res.setHeader("Content-Type", "text/plain");
            res.end("That campsite is already in your list of favorites!"); 
            }
        } else {
            Favorite.create({ 
                user: req.user._id, 
                campsites: [req.params.campsiteId] 
            })
            .then((favorite) => {
                res.setHeader("Content-Type", "application/json");
                res.json(favorite)
            })
            .catch(err => next(err))
        }
    })
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/:campsiteId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
})
}})


module.exports = favoriteRouter;