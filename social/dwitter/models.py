from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    follows = models.ManyToManyField(
                "self",
                related_name="followed_by",#accessed through
                symmetrical=False,
                blank=True
            )
    def __str__(self):
        return self.user.username
# ...
def create_profile(sender, instance, created, **kwargs):
    if created:
        user_profile = Profile(user=instance)
        user_profile.save()
    # Create a Profile for each new user.
post_save.connect(create_profile, sender=User)


class Dweet(models.Model):
    user = models.ForeignKey(User,

    related_name="dweets",
    on_delete=models.DO_NOTHING)

    body = models.CharField(max_length=140)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return (
        f"{self.user} "
        f"({self.created_at:%Y-%m-%d %H:%M}): "
        f"{self.body[:30]}..."
        )