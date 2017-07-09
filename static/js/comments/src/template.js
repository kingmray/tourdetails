
import {escapeForHTML} from './helpers';

export default class Template {
    /**
     * Format the contents of a todo list.
     *
     * @param {ItemList} items Object containing keys you want to find in the template to replace.
     * @returns {!string} Contents for a todo list
     *
     * @example
     * view.show({
     *  id: 1,
     *  title: "Hello World",
     *  completed: false,
     * })
     */
    commentList(items) {
        return items.reduce((a, item) => a + `
<li data-id="${item.id}"${item.completed ? ' class="completed"' : ''}>
    <label>${escapeForHTML(item.title)}</label>
    <button class="destroy"></button>
</li>`, '');
    }
}
