// {
//   message: 'The tag must be unique.',
//   validator(value) {
//     return new Promise((resolve) => {
//       const search = {
//         project: this.project,
//         tag: value,
//         deleted: {$eq: null}
//       };

//       // Ignore the id if this is an update.
//       if (this._id) {
//         search._id = {$ne: this._id};
//       }

//       formio.mongoose.model('tag').findOne(search).lean().exec(function(err, result) {
//         if (err || result) {
//           return resolve(false);
//         }

//         resolve(true);
//       });
//     });
//   }
// }
