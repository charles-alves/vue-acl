"use strict"

class Acl {

	init(router, permission) {
		this.router = router
		this.permission = permission
	}

	check(permission) {
		if(typeof permission != 'undefined')
			permission = (permission.indexOf('|') !== -1) ? permission.split('|') : permission

		if(Array.isArray(permission))
			return (permission.indexOf(this.permission) !== -1) ? true : false
		else
			return this.permission == permission
	}

	createCliLink() {
		const _this = this;
		return {
			name: 'cli-link',
			props: {
				to: {
					type: String,
					required: true
				},
				routerConfig: {
					type: Object
				}
			},
			methods: {
				getLinkPermissions (link) {
					let router = this.$router.resolve(link)
					if (router) {
						return router.resolved.meta.permission
					}

					return null
				}
			},
			computed: {
				options() {
					return {
						props: {
						...this.routerConfig,
						to: this.to
					}}
				}
			},
			render (createElement) {
				let permissions = this.getLinkPermissions(this.options.props.to)

				if (_this.check(permissions)) {
					return createElement('router-link', this.options, this.$slots.default)
				}

				return null
			}
		}
	}

	set router(router) {
		router.beforeEach((to, from, next) => {
			const fail = to.meta.fail || '/'
			if(typeof to.meta.permission == 'undefined')
				return next(fail)
			else {
				if(!this.check(to.meta.permission))
					return next(fail)
				next()
			}
		})
	}
}

let acl = new Acl()

Acl.install = function(Vue, {router, init}) {

	acl.init(router, init)

	Vue.prototype.$can = function(permission) {
		return acl.check(permission)
	}

	Vue.prototype.$access = function(newAccess = null) {
		if(newAccess != null)
			acl.permission = newAccess
		else
			return acl.permission
	}

	Vue.component('cli-link', acl.createCliLink())
}

export default Acl
