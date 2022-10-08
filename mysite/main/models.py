from pyexpat import model
from django.db import models

# Create your models here.


class main_as_database(models.Model):
    title   = models.CharField(max_length    = 20)
    age     = models.IntegerField( )
    content = models.TextField( )


class two(models.Model):
    title   = models.CharField(max_length    = 20)

class category(models.Model):
    cat_name = models.TextField()
    cat_decription =  models.TextField()