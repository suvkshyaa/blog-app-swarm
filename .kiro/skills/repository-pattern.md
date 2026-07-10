When adding a new resource, always: 
(1) create an Entity/Model file, 
(2) create a Repository with findById, findAll, create, update, delete methods, 
(3) create a Service that calls the Repository and applies business rules, 
(4) create a Controller that calls the Service only. Never put DB calls in controllers