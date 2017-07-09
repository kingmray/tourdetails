import {qs, qsAll, $on, $delegate} from "./helpers";

const _itemId = element => parseInt(element.parentNode.dataset.id, 10);

export default class View {
	/**
	 * @param {!Template} template instance
	 */
	constructor(template) {
		this.template = template;
		this.$commentList = qs('.comment-list');
		this.$main = qs('.main');
		this.$AllCommentList = qsAll('.new-comment');
	}

    /**
     * Populate the specific comment list with a list of items.
     *
     * @param {string} commentListId id of the post to get the element
     * @param {CommentList} comments Array of items to display
     */
    showSpecificItems(commentListId, comments) {
        var el = qs(commentListId);
        el.innerHTML = this.template.commentList(comments);
    }

    /**
     * @param {Function} handler Function called on synthetic event.
     */
    bindAddItem(handler, el) {
        $on(el, 'change', ({target}) => {
            const title = target.value.trim();
            const postid = target.getAttribute('data-postid');
            if (title) {
                handler(title, postid);
            }
        });
    }

    /**
     *
     */
    bindAddItemToAll(handler) {
        console.log(this.$AllCommentList);
        this.$AllCommentList.forEach(function(el) {
            this.bindAddItem(handler, el);
        });
    }

    /**
	 * Clear the new todo input
	 */
	clearNewTodo() {
		this.$newComment.value = '';
	}
}
