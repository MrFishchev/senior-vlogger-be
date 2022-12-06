import { Handler } from 'aws-cdk-lib/aws-lambda'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

type ShortPost = {
    id: number
    title: string
    slug: string
    category: string,
    tags: string[]
    imageUrl: string
    description: string
    publishDate: Date
  }

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('[EVENT]', event)

    var result: ShortPost[] = [{
        id: 1,
        title: 'My first post',
        slug: 'my-first-post',
        category: 'development',
        tags: ['test','aws','cloud'],
        imageUrl: 'https://c4.wallpaperflare.com/wallpaper/586/603/742/minimalism-4k-for-mac-desktop-wallpaper-preview.jpg',
        description: 'This post each that just leaf no. He connection interested so we an sympathize advantages. To said is it shed want do. Occasional middletons everything so to. Have spot part for his quit may. Enable it is square my an regard. Often merit stuff first oh up hills as he. Servants contempt as although addition dashwood is procured. Interest in yourself an do of numerous feelings cheerful confined.',
        publishDate: new Date()
    }]

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify(result)
    }
}