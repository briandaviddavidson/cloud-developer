import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import * as AWS from '../../../../aws';

const router: Router = Router();

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
    const items = await FeedItem.findAndCountAll({order: [['id', 'DESC']]});
    items.rows.map((item) => {
            if(item.url) {
                item.url = AWS.getGetSignedUrl(item.url);
            }
    });
    res.send(items);
});

//get a specific resource by key
router.get('/:id', async (req: Request, res: Response) => {
  let id = req.params.id;
  FeedItem.findOne({
    where: {
      id: id
    },
    order: [
      ['createdAt', 'DESC']
    ],
  }).then(item => {
    if (!item) {
      console.log('Not found!');
    } else {
      res.send(item)
    }
  })
});

// update a specific resource
router.patch('/:id', async (req: Request, res: Response) => {
  let body = req.body;
  await FeedItem.update(
    { caption: req.body.caption },
    { returning: true, where: { id: req.params.id } }
  )
  res.status(202).send({ message: "Caption updated" })
});


// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName',
    async (req: Request, res: Response) => {
    let { fileName } = req.params;
    const url = AWS.getPutSignedUrl(fileName);
    res.status(201).send({url: url});
});

// Post meta data and the filename after a file is uploaded
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/',
    async (req: Request, res: Response) => {
    const caption = req.body.caption;
    const fileName = req.body.url;

    // check Caption is valid
    if (!caption) {
        return res.status(400).send({ message: 'Caption is required or malformed' });
    }

    // check Filename is valid
    if (!fileName) {
        return res.status(400).send({ message: 'File url is required' });
    }

    const item = await new FeedItem({
            caption: caption,
            url: fileName
    });

    const saved_item = await item.save();

    saved_item.url = AWS.getGetSignedUrl(saved_item.url);
    res.status(201).send(saved_item);
});

export const FeedRouter: Router = router;
