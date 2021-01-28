const fs = require ('fs');
const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const APIFeatures = require ('./../utils/apiFeatures');
const catchAsync = require ('./../utils/catchAsync');


exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
    next();
};
//when i needed to parse  a json file for my Tour...
//const tours = JSON.parse (
   // fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`) 
   // );

exports.getAllTours =  catchAsync (async (req, res, next) => {
    
    //execute the query...
    const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().pagination();    
    const tours = await features.query;

   
    //another way to read query(filtering)
   // const query = await Tour.find()
   // .where('duraton')
   // .equals(5)
   // .where('difficulty')
   // .equals('easy');
   
    //send response...
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    });
});

exports.getTours = catchAsync ( async (req, res, next) => {
    const tour =  await Tour.findById(req.params.id);
      //for writing Tour.findOne({_id:req.params.id})
    if (!tour) {
      return next(new AppError('No tour Found with that ID', 404));
    }; 

    res.status(200).json({
        status: 'success',
            data: {
           tour
        }
    });
});

exports.createTour = catchAsync (async (req, res, next) => {
    //former way of doing it////for reference sake
    //const newTour = new Tour()
    //newTour.save()
    const  newTour =  await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
});

exports.updateTour = catchAsync( async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!tour) {
        return next(new AppError('No tour Found with that ID', 404));
      }; 

      res.status(200).json({
         status: 'success',
         data: {
             tour
         }
     });
})

exports.deleteTour = catchAsync ( async (req, res, next) => {    
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
        return next(new AppError('No tour Found with that ID', 404));
      }; 

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getTourStats = catchAsync( async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity'},
                avgRating: { $avg: '$ratingsAverage'},
                avgPrice: { $avg: '$price'},
                minPrice: { $min: '$price'},
                maxPrice: { $max: '$price'},
            }
        },
        {
            $sort: { avgPrice: 1 }
        },
        //prove that you can aggregate twice.
        //{
          //  $match: { _id: { $ne: 'EASY' }}
        //}
    ]);
    res.status(200).json({
        status: 'sucess',
        data: {
            stats
        }
    });
})

exports.getMonthlyPlan = catchAsync ( async (req, res, next) => {
    const year = req.params.year * 1;  //2021

        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-01`),
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $month: '$startDates'  
                    },
                    numTourStarts: { $sum: 1 },
                    tours: { $push: '$name' },
                   }
            },
            {
                $addFields: { month: '$_id' }
            },
            {
                $project: { 
                    _id: 0
                }
            },
            {
                $sort: { numTourStarts: -1 }
            },
            {
            }
        
        ]); 

        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        });
});
