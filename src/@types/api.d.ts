declare namespace Api {
  interface Base<T> {
    success: boolean
    data: {
      type: string
      message: string
      data: T
    }
  }

  interface PaginatedData<T> {
    total: string
    rows: Array<T>
    isLast: boolean
  }

  namespace Auth {
    interface Login {
      user: Omit<User.IUser, 'password', 'completed_password_setup'>
      userRoles: string[]
    }
  }
}
