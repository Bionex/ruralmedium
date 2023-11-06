import Hash from '@ioc:Adonis/Core/Hash'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import UserService from 'App/Services/UserService'

export default class UsersController {
  public async create({ view }: HttpContextContract) {
    return view.render('users/create')
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const email = request.input('email', undefined)
    var password = request.input('password', undefined)

    if (!email || !password) {
      response.status(400)
      return response
    }

    password = await Hash.make(password)
    const duplicatedUser = await User.findBy("email", email)

    if(duplicatedUser)
      return "Esse email ja foi cadastrado"

    const userService = new UserService()
    const user = await userService.create(email, password)

    await auth.login(user)

    return response.redirect().toRoute('users.show', { id: user.id, auth: auth })
  }

  public async show({ params, view, auth }: HttpContextContract) {
    const user = await User.findOrFail(params.id)

    return view.render('users/show', { user: user, auth: auth})
  }

  public async update({ response, view, auth}: HttpContextContract) {
    const user = auth.user

    if(user == undefined)
      return response.redirect().back()

    return view.render('users/update', { user: user, auth: auth})
  }

  public async patch({ params, request, response, auth}: HttpContextContract) {
    const user = await User.findOrFail(params.id)

    if(user.id == auth.user?.id){

      const email = request.input('email', undefined)
      const password = request.input('password', undefined)

      user.email = email ? email : user.email
      user.password = password ?  await Hash.make(password) : user.password

      await user.save()
    }

    return response.redirect().toRoute('users.show', { id: user.id, auth: auth})
  }

  public async index({ view, auth}: HttpContextContract) {
    const users = await User.all()

    return view.render('users/index', { users: users, auth: auth })
  }

  public async showLogin({view, auth}: HttpContextContract){
    return view.render('users/login', {auth: auth})
  }

  public async login({ request, response, auth, session }: HttpContextContract) {
    const email = await request.input('email')
    const password = await request.input('password')

    console.log(email, password)

    try {
      await auth.attempt(email,password)
      response.redirect('/')
    } catch {
      session.flash('form', 'Your email or password is incorrect')
      return response.redirect().back()
    }

  }

  //   logout function
  public async logout({ auth, response }: HttpContextContract) {
    await auth.logout()
    return response.redirect().toRoute('users.showLogin', {auth: auth})
  }

  public async self({response, view, auth}: HttpContextContract){
    const user = auth.user

    if(user == undefined)
      return response.redirect().toRoute('users.showLogin')

    return view.render('users/show', {user: user, auth: auth})
  }

}