# SaaS Course

<p align="center">This course was focused on delivering the different applications/softwares as a service. We were asked to implement a energy data analytics Saas with some specific functionalities. The project that we had to deliver had to be developed with microservices architecture.</p>

<p align="center">
	<img alt="Byte Code Size" src="https://img.shields.io/github/languages/code-size/ChristosHadjichristofi/SaaS77-NTUA?color=red" />
	<img alt="# Lines of Code" src="https://img.shields.io/tokei/lines/github/ChristosHadjichristofi/SaaS77-NTUA?color=red" />
	<img alt="# Languages Used" src="https://img.shields.io/github/languages/count/ChristosHadjichristofi/SaaS77-NTUA?color=yellow" />
	<img alt="Top language" src="https://img.shields.io/github/languages/top/ChristosHadjichristofi/SaaS77-NTUA?color=yellow" />
	<img alt="Last commit" src="https://img.shields.io/github/last-commit/ChristosHadjichristofi/SaaS77-NTUA?color=important" />
</p>

## Constraints of Project
The only constraint of the project by us was to use NodeJS.

## Technologies Stack
To develop the project with the MVC Architecture we used:
* ExpressJS Framework
* Sequelize as an ORM
* PostgreSQL for the database
* EJS for the Views
* Google Firebasee authentication
* Google Firebase for storing users data

## Microservices Architecture
To develop the project with the Microservices Architecture we started to make a plan on how to distribute the different functionalities of the project to different services. The distribution of functionalities to services is:
* data_import Service: Import atl, pl,agpt data with http requests from ENTSO-E database
* ATL Service: Manipulate data for Actual Total Load
* AGPT Service: Manipulate data for Aggregated Generation Per Type
* PL Service: Manipulate data for Physical Flows
* Kafka Service: Use by microservices to exhange meessages
* Front End: The presentation layer of the project


So when every service receives the event from Kafka, parses this message and does the job that message declare with the data contained in it

# Deployment
The deployment was done using Heroku and Confluent to host the kafka service. 

# Performance Testing
Performance evaluation of the project was implemented with Apache Jmeter. The scripts can be found in the related folder

# Demo of Project
You can use our project from the link below:
* [SaaS-58 Microservices](https://saas-58-ui1.herokuapp.com/)
