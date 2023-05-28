from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save


class Problem(models.Model):
    problem_id = models.CharField(max_length=25, null=True)
    submission_date = models.DateTimeField(auto_now=True)
    submission_status = models.CharField(max_length=10, default='submitted')
    user_code = models.TextField()


    def __str__(self):
        return f"Problem {self.problem_id} solved by "


def save_submission(sender, instance, created, *args, **kwargs):
    user = instance.user
    if created:
        profile = user.profile
        if profile.problems is None:
            profile.problems = instance
        else:
            profile.problems.add(instance)
        profile.save()
        print(profile)
    

post_save.connect(save_submission, sender=Problem)

def create_profile(sender, instance, created, **kwargs):
     if created:
          user_profile = Profile(user=instance)
          user_profile.save()

post_save.connect(create_profile, sender=User, dispatch_uid="create_profile_first")

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    problems = models.ManyToManyField('Problem', null=True, blank=True)