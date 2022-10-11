from pyexpat import model
from django.db import models

# Create your models here.

class category(models.Model):
    cat_name = models.TextField()
    cat_decription =  models.TextField()

    #Retriving post from categroy
    def get_post(self):
        return self.main_as_database_set.all()
    def __str__(self):
        return self.cat_name

class main_as_database(models.Model):
    #post_id = models.IntegerField(primary_key = True)
    title   = models.CharField(max_length    = 20)
    age     = models.IntegerField( )
    content = models.TextField( )
    #create many-one relation
    category = models.ForeignKey(category, on_delete=models.CASCADE)

    def __str__(self):
        return self.title #displys data in admin page

class two(models.Model):
    title   = models.CharField(max_length    = 20)

