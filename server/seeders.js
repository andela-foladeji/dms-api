import db from './models';

db.role.bulkCreate([{
  title: 'Admin'
},
{
  title: 'Regular'
}]);
