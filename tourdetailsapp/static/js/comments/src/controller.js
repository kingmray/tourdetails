import {emptyItemQuery} from "./item";
import Store from './store';
import View from './view';

export default class Controller {
	/**
	 * @param  {!Store} store A Store instance
	 * @param  {!View} view A View instance
	 */
	constructor(store, view) {
		this.store = store;
		this.view = view;
		view.bindAddItemToAll(this.save.bind(this));

		this._activeRoute = '';
		this._lastActiveRoute = null;
	}

	/**
	 * Set and render the active route.
	 *
	 * @param {string} raw '' | '#/' | '#/active' | '#/completed'
	 */
	setView(raw) {
		const route = raw.replace(/^#\//, '');
		this._activeRoute = route;
		this._filter();
		//this.view.updateFilterButtons(route);
	}

	/**
	 * Refresh the list based on the current route.
	 *
	 * @param {boolean} [force] Force a re-paint of the list
	 */
	_filter(force) {
		const route = this._activeRoute;

		if (force || this._lastActiveRoute !== '' || this._lastActiveRoute !== route) {
			/* jscs:disable disallowQuotedKeysInObjects */
			this.store.find({
				'': emptyItemQuery,
				'active': {completed: false},
				'completed': {completed: true}
			}[route], this.view.showItems.bind(this.view));
		}
		this._lastActiveRoute = route;
	}

    /**
	 * Remove the data and elements related to an Item.
	 *
	 * @param {!number} id Item ID of item to remove
	 */
	removeItem(id) {
		this.store.remove({id}, () => {
			this._filter();
			this.view.removeItem(id);
		});
	}

	binder(fn, context) {
    return function() {
        fn.apply(context, arguments);
        };
    };

	save(comment, theid) {
		const xhr = new XMLHttpRequest();

		xhr.open('POST', 'comments/save');
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.onreadystatechange = this.binder(function() {
			if (xhr.status === 200) {
				//alert('Something went wrong.  Name is now ' + xhr.responseText);
                //this.view.clearNewTodo();
                var data = JSON.parse(xhr.responseText);
                document.querySelectorAll('.new-comment').forEach(function(obj){
                    obj.value='';
                });

                const commentListId = '#comment-list-' + data.id;
                this.view.showSpecificItems(commentListId, data.list);

			}
			else if (xhr.status !== 200) {
				alert('Request failed.  Returned status of ' + xhr.status);
			}
		}, this);
		var ret = {};
		ret.id = Date.now();
		ret.title = comment;
		ret.data = theid;

		xhr.send(JSON.stringify(ret));

	}
}
