const express = require('express')
const bodyparser = require('body-parser')
const getday = require(__dirname + '/date.js')
const mongoose = require('mongoose')
const path = require('path')
const day = getday()
const _ = require('lodash')

const app = express()

app.set('view engine', 'ejs')

app.use(bodyparser.urlencoded({ extended: true }))
app.use(express.static('public'))

mongoose.connect('mongodb://localhost/todolistDB')

const itemSchema = {
  name: String,
}

const Item = mongoose.model('item', itemSchema)

const item1 = new Item({
  name: 'Buy milk',
})
const item2 = new Item({
  name: 'Buy food',
})
const item3 = new Item({
  name: 'Buy car',
})

const listSchema = {
  name: String,
  items: [itemSchema],
}

const List = mongoose.model('List', listSchema)

app.get('/', function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      //To insert default items only once
      Item.insertMany([item1, item2, item3], function (err) {
        if (err) {
          console.log(err)
        } else {
          console.log('Successfully inserted')
        }
      })
      res.redirect('/') //To render and show the default items
    } else {
      res.render('lists', { listTitle: 'Today', newListitems: foundItems })
    }
  })
})

app.get('/:customListName', function (req, res) {
  const listName = _.capitalize(req.params.customListName)
  List.findOne({ name: listName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: listName,
          items: [item1, item2, item3],
        })
        list.save()
        res.redirect('/' + listName)
      } else {
        res.render('lists', {
          listTitle: foundList.name,
          newListitems: foundList.items,
        })
      }
    }
  })
})

app.post('/', function (req, res) {
  const itemName = req.body.newitem
  const listName = req.body.list
  console.log('body: ', req.body)
  const item = new Item({
    name: itemName,
  })

  if (listName === 'Today') {
    item.save() //to save into database
    res.redirect('/')
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item) //pushing the items schema into list items
      foundList.save()
      res.redirect('/' + listName)
    })
  }
})

app.post('/delete', function (req, res) {
  const checkeditemid = req.body.checkbox
  const listName = req.body.listName
  if (listName === 'Today') {
    Item.findByIdAndRemove(checkeditemid, function (err) {
      if (err) {
        console.log(err)
      } else {
        res.redirect('/')
      }
    })
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkeditemid } } },
      function (err, foundList) {
        if (!err) {
          res.redirect('/' + listName)
        }
      }
    )
  }
})

app.listen(3000, function () {
  console.log('server is running on port 3000')
})
