#!/bin/bash
export FLASK_APP=tourdetailsapp
export FLASK_DEBUG=1
(cd tourdetailsapp && flask run)