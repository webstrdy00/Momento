"""Add content type, release channel, and series progress fields

Revision ID: content_series_20260426
Revises: add_auth_connections_20260307
Create Date: 2026-04-26

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "content_series_20260426"
down_revision: Union[str, None] = "add_auth_connections_20260307"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("UPDATE movies SET movie_type = 'movie' WHERE movie_type IS NULL OR movie_type = ''")
    op.alter_column(
        "movies",
        "movie_type",
        existing_type=sa.String(length=20),
        nullable=False,
        server_default="movie",
    )
    op.add_column(
        "movies",
        sa.Column("release_channel", sa.String(length=30), server_default="unknown", nullable=False),
    )
    op.add_column("movies", sa.Column("total_episodes", sa.Integer(), nullable=True))
    op.add_column("user_movies", sa.Column("current_season", sa.Integer(), nullable=True))
    op.add_column("user_movies", sa.Column("current_episode", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("user_movies", "current_episode")
    op.drop_column("user_movies", "current_season")
    op.drop_column("movies", "total_episodes")
    op.drop_column("movies", "release_channel")
    op.alter_column(
        "movies",
        "movie_type",
        existing_type=sa.String(length=20),
        nullable=True,
        server_default=None,
    )
