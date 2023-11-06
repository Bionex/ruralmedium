import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Post from 'App/Models/Post'
import PostService from 'App/Services/PostService'
import CreatePostValidator from 'App/Validators/CreatePostValidator'

export default class PostsController {
  public async create({ view, auth}: HttpContextContract) {
    return view.render('posts/create', {auth: auth})
  }

  public async store({ request, response, auth}: HttpContextContract) {
    const payload = await request.validate(CreatePostValidator)

    //TODO: Pegar o usuario logado
    const user = auth.user

    if(user == undefined)
      return response.redirect().toRoute('users.showLogin', {auth: auth})

    const postService = new PostService()
    const post = await postService.create(user, payload)

    return response.redirect().toRoute('posts.show', { id: post.id })
  }

  public async show({ params, view }: HttpContextContract) {
    const post = await Post.findOrFail(params.id)

    await post.load('user')

    return view.render('posts/show', { post: post })
  }

  public async update({}: HttpContextContract) {}

  public async patch({}: HttpContextContract) {}

  public async index({ view, auth }: HttpContextContract) {
    const posts = await Post.all()

    for(const post of posts){
      await post.load('user')
    }
    return view.render('posts/index', {posts: posts, auth: auth})
  }
}
