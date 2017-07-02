var Manager = {
    config: {},
    setConfig: function (settings) {
        this.config = settings;
    },
    init: function () {
        var fields = Array.from(document.querySelectorAll('ip-field'));
        fields.map(Manager.addListenerToField);
        
        var groups = Array.from(document.querySelectorAll('ip-group'));
        groups.map(Manager.addListenerToGroup);
    },
    addListenerToField: function(field) {
        // we don't want to add an event listener to id-fields that belong to an ip-group
        if (field.parentNode.localName != 'ip-group')
            field.addEventListener('click', Manager.transformToForm.bind(Manager, field));
    },
    addListenerToGroup: function (group) {
        group.addEventListener('click', Manager.transformToForm.bind(Manager, group));
    },
    transformToForm: function (element) {
        // this takes the group or field element and returns an array of Field objects
        var Fields = this.instantiateFields(element);

        // the wrapper is the span that the form get's put into
        var wrapper = this.newWrapper();
        Fields.map(function (Field) {
            wrapper.appendChild(Field.form());
        });
        element.parentNode.insertBefore(wrapper, element);
        element.style.display = 'none';
        
        // select the first field
        wrapper.childNodes[0].focus();

        // respond to the enter key being pressed anywhere inside newly created form
        wrapper.addEventListener('keyup', this.enterKeyPressed.bind(this, Fields));
        saveButton = this.appendSaveButtonTo(wrapper, Fields);
    },
    save: function (Fields) {
        this.updateDisplay(Fields);

        if (Fields[0].url != undefined) {
            // send off the new data
            var data = this.dataFrom(Fields);
            
            // check to see that there is actually data
            // if the data is empty, don't send post request
            if (Object.keys(data).length != 0 && JSON.stringify(data) != JSON.stringify({})) {
                // add sendWith parameters from the confi
                for (var param in this.config.sendWith) {
                    data[param] = this.config.sendWith[param];
                }

                // Grab send-with data from the group master
                if (Fields[0].element.parentNode.localName == 'ip-group') {
                    sendWithData = JSON.parse(Fields[0].element.parentNode.getAttribute('send-with'));
                    for (var param in sendWithData) { data[param] = sendWithData[param] }
                }

                this.sendPostRequest(Fields[0].url, data);
            }
        }

        this.closeForm(Fields); 
    },
    updateDisplay: function (Fields) {
        Fields.map(this.updateTextValue.bind(this));
    },
    closeForm: function (Fields) {
        if (Fields.length > 1) { // this checks to see if it is a group
            Fields[0].element.parentNode.style.display = '';
            Fields[0].element.parentNode.previousSibling.remove();
        } else {
            Fields.map(this.removeField);
            Fields.map(this.showText);
        }
    },
    instantiateField: function (element) {
        type = element.getAttribute('type');
        if (type == 'text')
            return new TextField(element);
        else if (type == 'select')
            return new SelectField(element);
        else if (type == 'checkbox')
            return new CheckboxField(element);
        else if (type == 'textarea')
            return new TextareaField(element);
    },
    instantiateFieldsFromGroup: function (groupElement) {
        fields = Array.from(groupElement.querySelectorAll('ip-field'));

        return fields.map(this.instantiateField.bind(this));
    },
    instantiateFields: function (Fields) {
        if (Fields.localName == 'ip-group')
           return this.instantiateFieldsFromGroup(Fields);
        else
            return [this.instantiateField(Fields)];
    },
    newWrapper: function () {
        var wrapper = document.createElement('span');
            wrapper.classList.add('ip-edit')

        return wrapper; 
    },
    transformToText: function (Field) {
        Field.element.style.display = '';
    },
    updateTextValue: function (Field) {
        Field.element.textContent = Field.getDisplay();
    },
    appendSaveButtonTo: function (wrapper, Fields) {
        var saveButton = document.createElement('button');
            saveButton.textContent = 'Save';
        wrapper.appendChild(saveButton); 
        saveButton.addEventListener('click', this.save.bind(this, Fields));

        return saveButton;
    },
    removeField: function (Field) {
        Field.form.parentNode.remove();
    },
    showText: function (Field) {
        Field.element.style.display = '';
    },
    enterKeyPressed: function (Fields, event) {
        key = event.which || event.keyCode;
        if (key === 13)
            this.save(Fields);
    },
    dataFrom: function (Fields) {
        var data = {}
        for (var i = 0; i < Fields.length; i++) {
            if (Fields[i].value != Fields[i].getValue())
                data[Fields[i].name] = Fields[i].getValue();
        }

        return data;
    },
    sendPostRequest: function (url, data) {
        var request = new XMLHttpRequest();
        request.open('POST', url);
        request.setRequestHeader("Content-type", "application/json");
        request.send(JSON.stringify(data));
    },
}

// TextFields
function TextField(element) {
    this.element = element;
    this.value = element.textContent;
    this.display = element.textContent;
    if (element.hasAttribute('post-url'))
        this.url = element.getAttribute('post-url');
    else if (element.parentNode.localName == 'ip-group' && element.parentNode.hasAttribute('post-url'))
        this.url = element.parentNode.getAttribute('post-url');
    if (element.hasAttribute('name'))
        this.name = element.getAttribute('name');
    if (element.hasAttribute('placeholder'))
        this.placeholder = element.getAttribute('placeholder');
    if (element.hasAttribute('if-empty'))
        this.emptyText = element.getAttribute('if-empty');
    if (element.hasAttribute('field-class'))
        this.fieldClass = element.getAttribute('field-class');
    if (element.hasAttribute('field-id'))
        this.fieldId = element.getAttribute('field-id');
};

TextField.prototype.form = function () {
    this.form = document.createElement('input');
    this.form.setAttribute('type', 'text');
    if ( ! this.element.classList.contains('empty'))
        this.form.setAttribute('value', this.element.textContent);
    else
        this.form.setAttribute('value', '');
    if (this.placeholder)
        this.form.setAttribute('placeholder', this.placeholder);
    if (this.fieldClass)
        this.form.setAttribute('class', this.fieldClass);
    if (this.fieldId)
        this.form.setAttribute('id', this.fieldId);

    return this.form;
}

TextField.prototype.getDisplay = function () {
    if (this.form.value.length > 0) {
        this.display = this.form.value;
        this.element.classList.remove('not-set');
    } else {
        this.display = this.emptyText;
        this.element.classList.add('not-set');
    }

    return this.display;
}

TextField.prototype.getValue = function () {
    this.value = this.form.value;

    return this.value;
}

function SelectField(element) {
    this.element = element;
    this.display = element.textContent;
    this.options = this.getOptions(element.getAttribute('options'));
    if (element.hasAttribute('post-url'))
        this.url = element.getAttribute('post-url');
    else if (element.parentNode.localName == 'ip-group' && element.parentNode.hasAttribute('post-url'))
        this.url = element.parentNode.getAttribute('post-url');
    if (element.hasAttribute('name'))
        this.name = element.getAttribute('name');
    if (element.hasAttribute('ip-id'))
        this.fieldId = element.getAttribute('ip-id');
    if (element.hasAttribute('ip-class'))
        this.fieldClass = element.getAttribute('ip-class');

    // let's find the value that matches the Display
    values = this.options.filter(function (option) {
        return option.display == this.display;
    }.bind(this));
    this.value = values[0].value;
}

SelectField.prototype.form = function () {
    this.form = document.createElement('select');
    if (this.fieldId)
        this.form.setAttribute('id', this.fieldId);
    if (this.fieldClass)
        this.form.setAttribute('class', this.fieldClass);
    optionFields = this.options.map(this.createOptionField.bind(this));
    optionFields.map(function(optionField) {
        this.form.appendChild(optionField); 
    }.bind(this));

    return this.form;
}

SelectField.prototype.getOptions = function (string) {
    try {
        return JSON.parse(string);
    } catch (e) {
        return string.split(',').map(function (option, index) {
            return {
                value: index,
                display: option,
            }
        });
    }
}

SelectField.prototype.createOptionField = function (option) {
    optionField = document.createElement('option');
    if (option.display[0] != undefined)
        optionField.textContent = option.display;
    optionField.setAttribute('value', option.value);

    if (option.display == this.display)
        optionField.setAttribute('selected', true);

    return optionField;
}

SelectField.prototype.isJSON = function (string) {
    try {
        JSON.parse(string);
    } catch (e) {
        return false;
    }
    return true;
}

SelectField.prototype.getDisplay = function () {
    if (this.form.value[0] != undefined) {
        var selected = this.options.filter(function (option) {
            return option.value == this.form.value;
        }.bind(this));
        this.display = selected[0].display;
    } else
        this.display = '';

    return this.display;
}

SelectField.prototype.getValue = function () {
    if (this.form.value[0] != undefined) {
        this.value = this.form.value;
    } else
        this.value = '';

    return this.value;
}

function CheckboxField(element) {
    this.element = element;
    this.display = element.textContent;
    this.trueText = element.getAttribute('ip-true');
    this.falseText = element.getAttribute('ip-false');
    this.formText = element.getAttribute('ip-toggle');
    if (element.textContent == this.trueText)
            this.value = true;
    else if (element.textContent == this.falseText)
            this.value = false;
    if (element.hasAttribute('post-url'))
        this.url = element.getAttribute('post-url');
    else if (element.parentNode.localName == 'ip-group' && element.parentNode.hasAttribute('post-url'))
        this.url = element.parentNode.getAttribute('post-url');

    if (element.hasAttribute('name'))
        this.name = element.getAttribute('name');
    if (element.hasAttribute('ip-id'))
        this.fieldId = element.getAttribute('ip-id');
    if (element.hasAttribute('ip-class'))
        this.fieldClass = element.getAttribute('ip-class');

}

CheckboxField.prototype.form = function () {
    text = document.createTextNode(this.formText);
    checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('id', this.fieldId);
    checkbox.setAttribute('class', this.fieldClass);

    if (this.display.toLowerCase() == this.trueText.toLowerCase())
        checkbox.setAttribute('checked', 'true');

    this.form = document.createElement('div');
    this.form.appendChild(checkbox);
    this.form.appendChild(text);

    return this.form;
}

CheckboxField.prototype.getDisplay = function () {
    if (this.form.childNodes[0].checked)
        this.display = this.trueText;
    else
        this.display = this.falseText;

    return this.display;
}

CheckboxField.prototype.getValue = function () {
    if (this.form.childNodes[0].checked)
        this.value = true;
    else
        this.value = false;

    return this.value
}

function TextareaField(element) {
    this.element = element;
    this.value = element.textContent;
    this.display = element.textContent;
    if (element.hasAttribute('post-url'))
        this.url = element.getAttribute('post-url');
    else if (element.parentNode.localName == 'ip-group' && element.parentNode.hasAttribute('post-url'))
        this.url = element.parentNode.getAttribute('post-url');
    if (element.hasAttribute('name'))
        this.name = element.getAttribute('name');
    if (element.hasAttribute('if-empty'))
        this.emptyText = element.getAttribute('if-empty');
    if (element.hasAttribute('field-class'))
        this.fieldClass = element.getAttribute('field-class');
    if (element.hasAttribute('field-id'))
        this.fieldId = element.getAttribute('field-id');
}

TextareaField.prototype.form = function () {
    this.form = document.createElement('textarea');
    if ( ! this.element.classList.contains('empty'))
        this.form.textContent = this.element.textContent;
    else
        this.form.setAttribute('value', '');
    if (this.fieldClass)
        this.form.setAttribute('class', this.fieldClass);
    if (this.fieldId)
        this.form.setAttribute('id', this.fieldId);

    return this.form;
}

TextareaField.prototype.getDisplay = function () {
    if (this.form.textContent.length > 0) {
        this.display = this.form.textContent;
        this.element.classList.remove('not-set');
    } else {
        this.display = this.emptyText;
        this.element.classList.add('not-set');
    }

    return this.display;
}

TextareaField.prototype.getValue = function () {
    this.value = this.form.textContent;

    return this.value;
}
