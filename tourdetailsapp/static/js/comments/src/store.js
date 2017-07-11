import {ItemList, ItemQuery} from './item';
export default class Store {
	/**
	 * @param {!string} name Database name
	 * @param {function()} [callback] Called when the Store is ready
	 */
	constructor(name, callback) {
		/**
		 * @type {Storage}
		 */
		const localStorage = window.localStorage;

		let liveComments;
		/**
		 * Read the local ItemList from localStorage.
		 *
		 * @returns {ItemList} Current array of comments
		 */
		this.getLocalStorage = () => {
			return liveComments || JSON.parse(localStorage.getItem(name) || '[]');
		};

		/**
		 * Write the local ItemList to localStorage.
		 *
		 * @param {ItemList} comments Array of comments to write
		 */
		this.setLocalStorage = (comments) => {
			localStorage.setItem(name, JSON.stringify(liveComments = comments));
		};

		if (callback) {
			callback();
		}


	}

    /**
     *
     * @param comment
     * @param callback
     */
	insert(comment, callback) {
		const comments = this.getLocalStorage();
		comments.push(comment);
		this.setLocalStorage(comments);

		if (callback) {
			callback();
		}
	}

	/**
	 * Find items with properties matching those on query.
	 *
	 * @param {ItemQuery} query Query to match
	 * @param {function(ItemList)} callback Called when the query is done
	 *
	 * @example
	 * db.find({completed: true}, data => {
	 *	 // data shall contain items whose completed properties are true
	 * })
	 */
	find(query, callback) {
	    const comments = this.getLocalStorage();
		let k;

		callback(comments.filter(comment => {
			for (k in query) {
				if (query[k] !== comment[k]) {
					return false;
				}
			}
			return true;
		}));
	}

	/**
	 * Remove items from the Store based on a query.
	 *
	 * @param {ItemQuery} query Query matching the items to remove
	 * @param {function(ItemList)|function()} [callback] Called when records matching query are removed
	 */
	remove(query, callback) {
		let k;

		const comments = this.getLocalStorage().filter(comment => {
			for (k in query) {
				if (query[k] !== comment[k]) {
					return true;
				}
			}
			return false;
		});

		this.setLocalStorage(comments);

		if (callback) {
			callback(comments);
		}
	}

}
